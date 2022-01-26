import { useRef } from 'react';

/**
 * Hook for accessing current and previous value.
 *
 * Prev will be same as currentValue on first render (not considered changed).
 * Note: isChanged only checks reference equality
 *
 * @param currentValue
 */
export function useCurrentPrevious<T>(currentValue: T) {
  const prev = useRef<T>(currentValue);
  const prevValue = prev.current;
  const returnVal = {
    current: currentValue,
    prev: prevValue,
    isChanged: currentValue !== prevValue,
  };
  prev.current = currentValue;
  return returnVal;
}
