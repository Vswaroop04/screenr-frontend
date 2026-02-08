/**
 * Validation utilities for form inputs
 */

/**
 * Validates email format
 * @param email - The email address to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return null;
}

/**
 * Validates that a field is not empty
 * @param value - The value to validate
 * @param fieldName - The name of the field for error message
 * @returns Error message if invalid, null if valid
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validates URL format
 * @param url - The URL to validate
 * @returns Error message if invalid, null if valid
 */
export function validateURL(url: string): string | null {
  // URL is optional, so empty is valid
  if (!url || !url.trim()) {
    return null;
  }

  try {
    new URL(url);
    return null;
  } catch {
    return "Please enter a valid URL (e.g., https://example.com)";
  }
}

/**
 * Validates phone number format (basic validation)
 * @param phone - The phone number to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePhone(phone: string): string | null {
  // Phone is optional, so empty is valid
  if (!phone || !phone.trim()) {
    return null;
  }

  // Basic phone validation: allow digits, spaces, hyphens, parentheses, and + sign
  const phoneRegex = /^[\d\s\-+()]+$/;
  if (!phoneRegex.test(phone)) {
    return "Please enter a valid phone number";
  }

  // Check minimum length (at least 10 digits)
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    return "Phone number must be at least 10 digits";
  }

  return null;
}
