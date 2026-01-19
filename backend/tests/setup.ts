/**
 * Jest setup file - runs before all tests
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Set NODE_ENV to 'test' to disable rate limiting during tests
process.env.NODE_ENV = 'test';

console.log('Test environment initialized');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Rate limiting: DISABLED during tests');
console.log('TOKEN_ADDRESS:', process.env.TOKEN_ADDRESS || 'NOT SET');
