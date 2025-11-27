/**
 * Test setup and configuration for frontend tests
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test utilities
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
