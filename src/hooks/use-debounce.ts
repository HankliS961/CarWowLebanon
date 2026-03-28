"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook that debounces a value.
 * Useful for search inputs to avoid excessive API calls.
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default 500ms)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
