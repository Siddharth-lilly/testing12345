/**
 * Custom hook for localStorage with React state sync
 */

import { useState, useEffect } from 'react';

/**
 * useLocalStorage - Hook for persisting state in localStorage
 * 
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage(key, initialValue) {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
