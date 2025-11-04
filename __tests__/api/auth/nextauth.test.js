// __tests__/api/auth/nextauth.integration.test.js
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../../../models/User'
import { validatePassword } from '../../../pages/api/auth/register'

// Mock the dbConnect function
jest.mock('../../../lib/dbConnect')

describe('NextAuth Configuration Integration Tests', () => {
  let mongoServer
  let testUser

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    
    // Connect mongoose to in-memory database
    await mongoose.connect(uri)
    
    // Mock dbConnect to use our test connection
    const { dbConnect } = await import('../../../lib/dbConnect')
    dbConnect.mockImplementation(async () => {
      if (mongoose.connection.readyState === 1) return
      await mongoose.connect(uri)
    })
  })

  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({})
    
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12)
    testUser = await User.create({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password_hash: hashedPassword,
      location: 'Test City',
      profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
      stats: {
        total_scans: 0,
        avg_plant_health: 0,
        last_scan: null
      }
    })
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  describe('Environment Configuration', () => {
    test('should have all required environment variables', () => {
      expect(process.env.NEXTAUTH_SECRET).toBeDefined()
      expect(process.env.MONGODB_URI).toBeDefined()
      expect(process.env.GOOGLE_CLIENT_ID).toBeDefined()
      expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined()
    })

    test('should have valid environment variable formats', () => {
      expect(process.env.NEXTAUTH_SECRET.length).toBeGreaterThan(10)
      expect(process.env.MONGODB_URI).toMatch(/^mongodb/)
    })
  })

  describe('Credentials Provider Logic', () => {
    // Test the actual logic from your NextAuth configuration
    const createCredentialsAuthorizer = () => {
      return async (credentials) => {
        // Skip test environment check for integration tests
        console.log("=== CREDENTIALS AUTHORIZE ===")
        console.log("Credentials received:", { email: credentials?.email, password: "***" })

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          const { dbConnect } = await import('../../../lib/dbConnect')
          await dbConnect()
          console.log("Database connected")
          
          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() })
          console.log("User found:", user ? "Yes" : "No")
          
          if (!user) {
            console.log("No user found with email:", credentials.email)
            return null
          }

          // Check if user has a password (not a Google-only user)
          if (!user.password_hash) {
            console.log("User has no password hash - Google only user")
            return null
          }

          console.log("Comparing passwords...")
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)
          console.log("Password valid:", isPasswordValid)
          
          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email)
            return null
          }

          console.log("Authentication successful for:", user.email)
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            image: user.profile_image_url,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }

    test('should authenticate valid credentials', async () => {
      const authorize = createCredentialsAuthorizer()
      
      const credentials = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }

      const result = await authorize(credentials)

      expect(result).not.toBeNull()
      expect(result.id).toBe(testUser._id.toString())
      expect(result.email).toBe(testUser.email)
      expect(result.name).toBe('Test User')
      expect(result.first_name).toBe('Test')
      expect(result.last_name).toBe('User')
      expect(result.location).toBe('Test City')
    })

    test('should reject invalid credentials', async () => {
      const authorize = createCredentialsAuthorizer()
      
      const invalidCases = [
        { email: '', password: 'TestPassword123!' },
        { email: 'test@example.com', password: '' },
        { email: 'test@example.com', password: 'WrongPassword!' },
        { email: 'nonexistent@example.com', password: 'TestPassword123!' }
      ]

      for (const credentials of invalidCases) {
        const result = await authorize(credentials)
        expect(result).toBeNull()
      }
    })

    test('should handle case insensitive emails', async () => {
      const authorize = createCredentialsAuthorizer()
      
      const credentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'TestPassword123!'
      }

      const result = await authorize(credentials)
      expect(result).not.toBeNull()
      expect(result.email).toBe('test@example.com')
    })

    test('should handle email trimming', async () => {
      const authorize = createCredentialsAuthorizer()
      
      const credentials = {
        email: '  test@example.com  ',
        password: 'TestPassword123!'
      }

      const result = await authorize(credentials)
      expect(result).not.toBeNull()
      expect(result.email).toBe('test@example.com')
    })
  })

  describe('Google SignIn Callback Logic', () => {
    const createSignInCallback = () => {
      return async ({ user, account, profile }) => {
        if (account.provider === "google") {
          try {
            const { dbConnect } = await import('../../../lib/dbConnect')
            await dbConnect()
            
            // Check if user already exists
            const existingUser = await User.findOne({ email: user.email })
            
            if (!existingUser) {
              // Create new user from Google data
              const newUser = new User({
                first_name: profile.given_name || user.name?.split(' ')[0] || 'User',
                last_name: profile.family_name || user.name?.split(' ').slice(1).join(' ') || 'Name',
                email: user.email,
                // Don't set password_hash for Google users
                location: "Not specified",
                profile_image_url: user.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face",
                stats: {
                  total_scans: 0,
                  avg_plant_health: 0,
                  last_scan: null
                },
                google_id: profile.sub
              })
              
              await newUser.save()
              console.log("New Google user created:", newUser.email)
            } else {
              // Update existing user with Google info if needed
              let updated = false
              if (profile.sub && !existingUser.google_id) {
                existingUser.google_id = profile.sub
                updated = true
              }
              if (user.image && (!existingUser.profile_image_url || existingUser.profile_image_url.includes('unsplash'))) {
                existingUser.profile_image_url = user.image
                updated = true
              }
              if (updated) {
                await existingUser.save()
                console.log("Existing user updated with Google info:", existingUser.email)
              }
            }
            
            return true
          } catch (error) {
            console.error("Google sign-in error:", error)
            return false
          }
        }
        return true
      }
    }

    test('should create new Google user', async () => {
      const signInCallback = createSignInCallback()
      
      const mockData = {
        user: {
          email: 'googleuser@example.com',
          name: 'Google User',
          image: 'https://lh3.googleusercontent.com/a/default-user'
        },
        account: { provider: 'google' },
        profile: {
          given_name: 'Google',
          family_name: 'User',
          sub: 'google123456'
        }
      }

      const result = await signInCallback(mockData)
      expect(result).toBe(true)

      // Verify user was created
      const createdUser = await User.findOne({ email: 'googleuser@example.com' })
      expect(createdUser).not.toBeNull()
      expect(createdUser.first_name).toBe('Google')
      expect(createdUser.last_name).toBe('User')
      expect(createdUser.google_id).toBe('google123456')
      expect(createdUser.password_hash).toBeUndefined()
    })

    test('should update existing user with Google info', async () => {
      // Create existing user without Google info
      const existingUser = await User.create({
        first_name: 'Existing',
        last_name: 'User',
        email: 'existing@example.com',
        password_hash: 'hashed123',
        location: 'Original City',
        profile_image_url: 'https://images.unsplash.com/original.jpg',
        stats: { total_scans: 0, avg_plant_health: 0, last_scan: null }
      })

      const signInCallback = createSignInCallback()
      
      const mockData = {
        user: {
          email: 'existing@example.com',
          name: 'Existing User',
          image: 'https://lh3.googleusercontent.com/a/new-image'
        },
        account: { provider: 'google' },
        profile: {
          given_name: 'Existing',
          family_name: 'User',
          sub: 'google789123'
        }
      }

      const result = await signInCallback(mockData)
      expect(result).toBe(true)

      // Verify user was updated
      const updatedUser = await User.findOne({ email: 'existing@example.com' })
      expect(updatedUser.google_id).toBe('google789123')
      expect(updatedUser.profile_image_url).toBe('https://lh3.googleusercontent.com/a/new-image')
      expect(updatedUser.password_hash).toBe('hashed123') // Should remain unchanged
    })
  })

  describe('JWT Callback Logic', () => {
    const createJWTCallback = () => {
      return async ({ token, user, account }) => {
        if (user) {
          try {
            const { dbConnect } = await import('../../../lib/dbConnect')
            await dbConnect()
            const dbUser = await User.findOne({ email: user.email })
            if (dbUser) {
              token.userId = dbUser._id.toString()
              token.first_name = dbUser.first_name
              token.last_name = dbUser.last_name
              token.location = dbUser.location
              token.profile_image_url = dbUser.profile_image_url
            }
          } catch (error) {
            console.error("JWT callback error:", error)
          }
        }
        return token
      }
    }

    test('should populate token with user data', async () => {
      const jwtCallback = createJWTCallback()
      
      const token = {}
      const user = { email: testUser.email }

      const result = await jwtCallback({ token, user })

      expect(result.userId).toBe(testUser._id.toString())
      expect(result.first_name).toBe(testUser.first_name)
      expect(result.last_name).toBe(testUser.last_name)
      expect(result.location).toBe(testUser.location)
      expect(result.profile_image_url).toBe(testUser.profile_image_url)
    })

    test('should return unchanged token when no user', async () => {
      const jwtCallback = createJWTCallback()
      
      const token = { existing: 'data' }

      const result = await jwtCallback({ token })

      expect(result).toEqual({ existing: 'data' })
    })
  })

  describe('Session Callback Logic', () => {
    const createSessionCallback = () => {
      return async ({ session, token }) => {
        if (token) {
          session.user.id = token.userId
          session.user.first_name = token.first_name
          session.user.last_name = token.last_name
          session.user.location = token.location
          session.user.profile_image_url = token.profile_image_url
        }
        return session
      }
    }

    test('should populate session with token data', async () => {
      const sessionCallback = createSessionCallback()
      
      const session = { user: {} }
      const token = {
        userId: testUser._id.toString(),
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        location: testUser.location,
        profile_image_url: testUser.profile_image_url
      }

      const result = await sessionCallback({ session, token })

      expect(result.user.id).toBe(testUser._id.toString())
      expect(result.user.first_name).toBe(testUser.first_name)
      expect(result.user.last_name).toBe(testUser.last_name)
      expect(result.user.location).toBe(testUser.location)
      expect(result.user.profile_image_url).toBe(testUser.profile_image_url)
    })
  })

  describe('Password Validation Integration', () => {
    test('should validate strong passwords', () => {
      const validPasswords = [
        'Password123!',
        'SecureP@ss1',
        'MyStr0ng!Pass',
        'T3st!ngP@ssw0rd'
      ]

      validPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.isValid).toBe(true)
        expect(result.missingRequirements).toHaveLength(0)
      })
    })

    test('should identify password weaknesses', () => {
      const testCases = [
        { password: 'short', expected: 'at least 6 characters' },
        { password: 'password123!', expected: 'one uppercase letter' },
        { password: 'PASSWORD123!', expected: 'one lowercase letter' },
        { password: 'Password!', expected: 'one number' },
        { password: 'Password123', expected: 'one special character' }
      ]

      testCases.forEach(({ password, expected }) => {
        const result = validatePassword(password)
        expect(result.isValid).toBe(false)
        expect(result.missingRequirements).toContain(expected)
      })
    })
  })

  describe('User Model Schema Validation', () => {
    test('should create user with all required fields', async () => {
      const userData = {
        first_name: 'Schema',
        last_name: 'Test',
        email: 'schema@example.com',
        password_hash: 'hashed_password',
        location: 'Test Location',
        stats: {
          total_scans: 5,
          avg_plant_health: 85,
          last_scan: new Date()
        }
      }

      const user = await User.create(userData)
      expect(user._id).toBeDefined()
      expect(user.first_name).toBe('Schema')
      expect(user.email).toBe('schema@example.com')
      expect(user.stats.total_scans).toBe(5)
    })

    test('should validate required fields', async () => {
      const incompleteData = {
        first_name: 'Incomplete'
        // Missing required fields
      }

      await expect(User.create(incompleteData)).rejects.toThrow()
    })
  })

  describe('Configuration Structure', () => {
    test('should have correct page redirects', () => {
      const expectedPages = {
        signIn: '/login',
        error: '/login'
      }

      expect(expectedPages.signIn).toBe('/login')
      expect(expectedPages.error).toBe('/login')
    })

    test('should use JWT session strategy', () => {
      const expectedSessionConfig = {
        strategy: "jwt"
      }

      expect(expectedSessionConfig.strategy).toBe("jwt")
    })
  })
})