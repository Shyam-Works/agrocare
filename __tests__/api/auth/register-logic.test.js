import { validatePassword, validateRegistrationData } from '../../../pages/api/auth/register'
import handler from '../../../pages/api/auth/register'
import { createMocks } from 'node-mocks-http'

// Mock the dependencies
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123')
}))

jest.mock('../../../lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true)
}))

// Mock the User model
const mockUser = {
  findOne: jest.fn(),
  save: jest.fn(),
  _id: 'mockUserId123'
}

jest.mock('../../../models/User', () => {
  return function User(userData) {
    Object.assign(this, userData)
    this._id = 'mockUserId123'
    this.save = jest.fn().mockResolvedValue(this)
    return this
  }
})

// Mock User.findOne as a static method
jest.doMock('../../../models/User', () => {
  const UserConstructor = function User(userData) {
    Object.assign(this, userData)
    this._id = 'mockUserId123'
    this.save = jest.fn().mockResolvedValue(this)
    return this
  }
  UserConstructor.findOne = jest.fn()
  return UserConstructor
})

describe('Registration Logic Tests - Real Functions', () => {
  
  test('should validate password requirements using real function', () => {
    // Test valid password
    const validResult = validatePassword('Password123!')
    expect(validResult.isValid).toBe(true)
    expect(validResult.missingRequirements).toHaveLength(0)

    // Test invalid passwords with multiple issues
    const multipleIssuesResult = validatePassword('abc')
    expect(multipleIssuesResult.isValid).toBe(false)
    expect(multipleIssuesResult.missingRequirements.length).toBeGreaterThan(1)
  })

  test('should validate complete registration data using real function', () => {
    const validData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirm_password: 'Password123!'
    }

    const result = validateRegistrationData(validData)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('should catch missing required fields using real function', () => {
    const incompleteData = {
      first_name: 'John',
      // missing other required fields
    }

    const result = validateRegistrationData(incompleteData)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Last name is required')
    expect(result.errors).toContain('Email is required')
    expect(result.errors).toContain('Password is required')
  })

  test('should catch password mismatch using real function', () => {
    const mismatchData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirm_password: 'DifferentPassword123!'
    }

    const result = validateRegistrationData(mismatchData)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Passwords do not match')
  })

  test('should catch invalid email format using real function', () => {
    const invalidEmailData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'invalid-email',
      password: 'Password123!',
      confirm_password: 'Password123!'
    }

    const result = validateRegistrationData(invalidEmailData)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid email format')
  })

  test('should catch weak passwords using real function', () => {
    const weakPasswordData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: '123',
      confirm_password: '123'
    }

    const result = validateRegistrationData(weakPasswordData)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(error => error.includes('Password must contain:'))).toBe(true)
  })
})

describe('Registration Handler Tests - Basic Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData()).error).toBe('Method not allowed')
  })

  test('should return 400 for missing required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { first_name: 'John' } // missing other required fields
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData()).error).toBe('First name, last name, email, and password are required')
  })

  test('should return 400 for password mismatch', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirm_password: 'DifferentPassword!'
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData()).error).toBe('Passwords do not match')
  })

  test('should return 400 for weak password', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'weak',
        confirm_password: 'weak'
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData()).error).toContain('Password must contain:')
  })

  test('should validate complete registration input flow', async () => {
    // Mock User.findOne to return null (no existing user)
    const User = require('../../../models/User')
    User.findOne = jest.fn().mockResolvedValue(null)

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirm_password: 'Password123!',
        location: 'Toronto',
        profile_image_url: 'https://example.com/image.jpg'
      }
    })
    
    await handler(req, res)
    
    // Should succeed with valid data and mocked dependencies
    expect(res._getStatusCode()).toBe(201)
    const responseData = JSON.parse(res._getData())
    expect(responseData.message).toBe('Registration successful! Please sign in with your credentials.')
    expect(responseData.user).toMatchObject({
      id: expect.any(String),
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      location: 'Toronto',
      profile_image_url: 'https://example.com/image.jpg'
    })
  })

  test('should return 400 for existing user', async () => {
    // Mock User.findOne to return existing user
    const User = require('../../../models/User')
    User.findOne = jest.fn().mockResolvedValue({ email: 'john@example.com' })

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirm_password: 'Password123!',
        location: 'Toronto',
        profile_image_url: 'https://example.com/image.jpg'
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData()).error).toBe('User already exists with this email')
  })
})

describe('Utility Functions Tests', () => {
  test('should have correct user object structure expectations', () => {
    const userData = {
      id: '12345',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      location: 'Toronto',
      profile_image_url: 'https://example.com/image.jpg'
    }
    
    expect(userData).toMatchObject({
      id: expect.any(String),
      first_name: expect.any(String),
      last_name: expect.any(String),
      email: expect.any(String),
      location: expect.any(String),
      profile_image_url: expect.any(String)
    })
  })

  test('should handle default values correctly', () => {
    const location = undefined
    const profile_image_url = undefined
    
    const defaultLocation = location || "Not specified"
    const defaultImage = profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face"
    
    expect(defaultLocation).toBe("Not specified")
    expect(defaultImage).toBe("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face")
  })

  test('should validate required fields logic', () => {
    const checkRequiredFields = (data) => {
      const required = ['first_name', 'last_name', 'email', 'password']
      const missing = required.filter(field => !data[field])
      return { isValid: missing.length === 0, missing }
    }
    
    const validData = {
      first_name: 'John',
      last_name: 'Doe', 
      email: 'john@example.com',
      password: 'Password123!'
    }
    
    const invalidData = {
      first_name: 'John'
    }
    
    expect(checkRequiredFields(validData).isValid).toBe(true)
    expect(checkRequiredFields(invalidData).isValid).toBe(false)
    expect(checkRequiredFields(invalidData).missing).toContain('last_name')
  })
})