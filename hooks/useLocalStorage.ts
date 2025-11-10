
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === key && event.newValue) {
        try {
            setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
            console.error(error);
        }
    } else if (event.key === key && !event.newValue) {
        setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);


  return [storedValue, setStoredValue];
}

export default useLocalStorage;
