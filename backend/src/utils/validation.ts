import { ValidationError } from './errors.js';

/**
 * Validate email format
 */
export const validateEmail = (email: string): void => {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  
  // Check for common SQL injection patterns
  if (/['";\\]/.test(email)) {
    throw new ValidationError('Email contains invalid characters');
  }
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): void => {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required');
  }
  
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    throw new ValidationError('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    throw new ValidationError('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    throw new ValidationError('Password must contain at least one number');
  }
};

/**
 * Validate name
 */
export const validateName = (name: string): void => {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('Name is required');
  }
  
  if (name.trim().length === 0) {
    throw new ValidationError('Name cannot be empty');
  }
  
  if (name.length > 255) {
    throw new ValidationError('Name must be less than 255 characters');
  }
  
  // Check for SQL injection patterns
  if (/['";\\]/.test(name)) {
    throw new ValidationError('Name contains invalid characters');
  }
};

/**
 * Validate UUID format
 */
export const validateUUID = (uuid: string, fieldName: string = 'ID'): void => {
  if (!uuid || typeof uuid !== 'string') {
    throw new ValidationError(`${fieldName} is required`);
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
};

/**
 * Validate positive integer
 */
export const validatePositiveInteger = (value: any, fieldName: string = 'Value'): number => {
  const num = Number(value);
  
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }
  
  if (!Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }
  
  if (num <= 0) {
    throw new ValidationError(`${fieldName} must be positive`);
  }
  
  return num;
};

/**
 * Validate price (positive number with max 2 decimal places)
 */
export const validatePrice = (value: any, fieldName: string = 'Price'): number => {
  const num = Number(value);
  
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }
  
  if (num < 0) {
    throw new ValidationError(`${fieldName} cannot be negative`);
  }
  
  // Check for max 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
    throw new ValidationError(`${fieldName} can have at most 2 decimal places`);
  }
  
  return num;
};

/**
 * Validate string length
 */
export const validateStringLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string = 'Field'
): void => {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${fieldName} is required`);
  }
  
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
  }
  
  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be less than ${maxLength} characters`);
  }
};

/**
 * Validate enum value
 */
export const validateEnum = <T extends string>(
  value: string,
  allowedValues: T[],
  fieldName: string = 'Value'
): T => {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
  return value as T;
};

/**
 * Sanitize and validate product category
 */
export const validateCategory = (category: string): void => {
  const allowedCategories = ['wig', 'hat', 'mask', 'accessory', 'makeup'];
  validateEnum(category, allowedCategories, 'Category');
};

/**
 * Sanitize and validate product theme
 */
export const validateTheme = (theme: string): void => {
  const allowedThemes = ['witch', 'zombie', 'vampire', 'skeleton', 'ghost'];
  validateEnum(theme, allowedThemes, 'Theme');
};
