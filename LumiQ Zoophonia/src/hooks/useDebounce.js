import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value`.
 * Usage: const debouncedSearch = useDebounce(searchQuery, 350);
 */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
