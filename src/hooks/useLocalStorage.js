import { useState, useEffect } from "react";

/**
 * Hook para sincronizar estado com localStorage.
 * Substitua localStorage por uma API futuramente (Supabase etc.).
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // silencia erros de quota
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
