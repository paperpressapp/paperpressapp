/**
 * ID Generation Utilities
 * 
 * Helper functions for generating unique identifiers.
 */

/**
 * Generate a random string
 * @param length - Length of the random string
 * @returns Random alphanumeric string
 */
function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique ID
 * Format: timestamp_randomstring
 * Example: "1704067200000_a1b2c3d4"
 * @returns Unique ID string
 */
export function generateId(): string {
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  return `${timestamp}_${randomString}`;
}

/**
 * Generate a paper-specific ID
 * Format: "paper_" + generateId()
 * @returns Paper ID string
 */
export function generatePaperId(): string {
  return `paper_${generateId()}`;
}

/**
 * Generate a user-specific ID
 * Format: "user_" + generateId()
 * @returns User ID string
 */
export function generateUserId(): string {
  return `user_${generateId()}`;
}

/**
 * Generate a session ID
 * Format: "session_" + generateId()
 * @returns Session ID string
 */
export function generateSessionId(): string {
  return `session_${generateId()}`;
}
