/**
 * Test setup and configuration for frontend tests
 */

import '@testing-library/jest-dom';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test utilities
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
