/**
 * Authentication Types
 * 
 * Types for user authentication including sign up, sign in, and user data.
 */

/**
 * Data required for user sign up
 */
export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

/**
 * Data required for user sign in
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Basic user information
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
