import { ForwardedRef, MutableRefObject, useCallback } from 'react';

/**
 * Callback that sets all provided refs.
 *
 * Useful when you need multiple reference handles to the same component.
 *
 * For instance, a ref for your local state and for forwarded Sanity ref in custom input component.
 *
 * ## Usage
 * ```tsx
 * function SomeComponent(props: any, forwardRef: ForwardedRef<HTMLDivElement>) {
 *  const ref = useRef<HTMLDivElement | null>(null)
 *  const setRefs = useSetRefs(ref, forwardRef);
 *  return <div ref={setRefs} />;
 * }
 *```
 * @param refs - typically values from from useRef or forwardRef passed by Sanity (custom component prop)
 */
export function useSetRefs<T>(...refs: (MutableRefObject<T> | ForwardedRef<T>)[]) {
  return useCallback((e: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(e);
      } else if (typeof ref === 'object' && ref !== null) {
        ref.current = e;
      }
    });
  }, refs);
}
