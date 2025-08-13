// Storage utility functions for localStorage management

export const storage = {
  // Set item in localStorage
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  // Get item from localStorage
  get: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  // Remove item from localStorage
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  // Clear all localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Check if key exists in localStorage
  has: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking localStorage key "${key}":`, error);
      return false;
    }
  },

  // Get all keys from localStorage
  keys: (): string[] => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }
};

// Specific storage keys for the application
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

// Type-safe storage functions for common use cases
export const authStorage = {
  setToken: (token: string): void => storage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: (): string | null => storage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  removeToken: (): void => storage.remove(STORAGE_KEYS.AUTH_TOKEN),
  
  setUser: (user: any): void => storage.set(STORAGE_KEYS.USER, user),
  getUser: <T>(): T | null => storage.get<T>(STORAGE_KEYS.USER),
  removeUser: (): void => storage.remove(STORAGE_KEYS.USER),
  
  clear: (): void => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  }
};
