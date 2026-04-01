/**
 * Validation Utilities
 * Provides functions for common input validation scenarios
 */

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation
  isValidPassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Name validation
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  // Phone validation
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // URL validation
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Price validation
  isValidPrice: (price: string | number): boolean => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) && numPrice > 0 && numPrice < 1000000;
  },

  // Date validation
  isValidDate: (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  },

  // Future date validation
  isFutureDate: (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return validators.isValidDate(dateObj) && dateObj > new Date();
  },

  // Length validation
  isValidLength: (
    value: string,
    minLength: number,
    maxLength: number
  ): boolean => {
    return value.length >= minLength && value.length <= maxLength;
  },

  // Required field
  isRequired: (value: string | number | null | undefined): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  // Numeric validation
  isNumeric: (value: string): boolean => {
    return /^\d+(\.\d+)?$/.test(value);
  },

  // Alphanumeric validation
  isAlphanumeric: (value: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(value);
  },
};

// Validation rules for common form fields
export const validationRules = {
  email: (email: string): string | null => {
    if (!validators.isRequired(email)) {
      return 'Email is required';
    }
    if (!validators.isValidEmail(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (password: string): string | null => {
    if (!validators.isRequired(password)) {
      return 'Password is required';
    }
    const validation = validators.isValidPassword(password);
    if (!validation.valid) {
      return validation.errors[0];
    }
    return null;
  },

  name: (name: string): string | null => {
    if (!validators.isRequired(name)) {
      return 'Name is required';
    }
    if (!validators.isValidName(name)) {
      return 'Name must be between 2 and 100 characters';
    }
    return null;
  },

  phone: (phone: string): string | null => {
    if (!validators.isRequired(phone)) {
      return 'Phone number is required';
    }
    if (!validators.isValidPhoneNumber(phone)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  price: (price: string | number): string | null => {
    if (price === '' || price === null || price === undefined) {
      return 'Price is required';
    }
    if (!validators.isValidPrice(price)) {
      return 'Please enter a valid price (between 0 and 999,999)';
    }
    return null;
  },

  description: (description: string): string | null => {
    if (!validators.isRequired(description)) {
      return 'Description is required';
    }
    if (!validators.isValidLength(description, 10, 1000)) {
      return 'Description must be between 10 and 1000 characters';
    }
    return null;
  },

  category: (category: string): string | null => {
    const validCategories = ['Electronics', 'Sports', 'Outdoors', 'Books', 'Furniture'];
    if (!validators.isRequired(category)) {
      return 'Category is required';
    }
    if (!validCategories.includes(category)) {
      return 'Please select a valid category';
    }
    return null;
  },

  location: (location: string): string | null => {
    if (!validators.isRequired(location)) {
      return 'Location is required';
    }
    if (!validators.isValidLength(location, 2, 100)) {
      return 'Location must be between 2 and 100 characters';
    }
    return null;
  },
};

// Form validation helper
export const validateForm = (
  formData: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((fieldName) => {
    const error = rules[fieldName](formData[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

export default validators;
