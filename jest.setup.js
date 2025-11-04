// jest.setup.js - Clean setup without hanging issues
require('@testing-library/jest-dom')

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.JWT_SECRET = 'test-jwt-secret-for-testing'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-key-for-jwt-signing'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'

// Simple timeout
jest.setTimeout(15000)

// Suppress mongoose warnings in tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('[MONGOOSE]') || args[0].includes('Duplicate schema index'))
  ) {
    return
  }
  originalWarn.call(console, ...args)
}

// Global test utilities
global.createTestUser = (overrides = {}) => ({
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  password: 'TestPassword123!',
  confirm_password: 'TestPassword123!',
  location: 'Test City',
  ...overrides
})

global.createValidRegistrationData = (overrides = {}) => ({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!',
  confirm_password: 'SecurePassword123!',
  location: 'Toronto',
  profile_image_url: 'https://example.com/profile.jpg',
  ...overrides
})

// Test data generators
global.generateUniqueEmail = () => `test${Date.now()}${Math.random().toString(36).substr(2, 9)}@example.com`

global.testPasswords = {
  valid: [
    'Password123!',
    'SecureP@ss1',
    'MyStr0ng!Pass',
    'T3st!ngP@ssw0rd'
  ],
  invalid: {
    tooShort: 'P@1',
    noUppercase: 'password123!',
    noLowercase: 'PASSWORD123!',
    noNumber: 'Password!',
    noSpecialChar: 'Password123',
    empty: ''
  }
}

// Clean up before each test
beforeEach(() => {
  jest.clearAllMocks()
})