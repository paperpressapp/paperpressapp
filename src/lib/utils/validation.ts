/**
 * Validation Utilities
 * 
 * Helper functions for validating user input.
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password (minimum 8 characters)
 * @param password - Password to validate
 * @returns True if password is at least 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate Pakistani phone number format
 * @param phone - Phone number to validate
 * @returns True if valid Pakistani phone format
 */
export function isValidPhone(phone: string): boolean {
  // Remove all spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check for +92 format (e.g., +923001234567)
  const plus92Regex = /^\+92[0-9]{10}$/;
  
  // Check for 03 format (e.g., 03001234567)
  const zero3Regex = /^03[0-9]{9}$/;
  
  return plus92Regex.test(cleanPhone) || zero3Regex.test(cleanPhone);
}

/**
 * Validate name (letters and spaces only, minimum 2 characters)
 * @param name - Name to validate
 * @returns True if valid name
 */
export function isValidName(name: string): boolean {
  // Check minimum length
  if (name.trim().length < 2) {
    return false;
  }
  
  // Check only letters and spaces (supports Unicode letters for international names)
  const nameRegex = /^[\p{L}\s'-]+$/u;
  return nameRegex.test(name.trim());
}

/**
 * Validate that a string is not empty
 * @param value - String to check
 * @returns True if not empty or whitespace only
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate that a value is within a range
 * @param value - Number to check
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns True if within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
