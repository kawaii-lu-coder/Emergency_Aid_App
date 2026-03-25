import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fnRef = useRef(fn);
  
  // Keep fnRef up to date
  fnRef.current = fn;
  
  const debouncedFn = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  }, [delay]);
  
  // Flush pending execution immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  // Cancel pending execution
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return Object.assign(debouncedFn, { flush, cancel });
}
