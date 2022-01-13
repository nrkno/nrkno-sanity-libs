import { useLayoutEffect, useState } from 'react';

let CreateResizeObserver = window.ResizeObserver;

/**
 *
 * Invokes onChange-callback whenever the provided element changes.
 *
 * ## Usage
 *```ts
 * function SomeComponent() {
 * //useState and NOT useRef
 *  const [ref, setRef] = useState<HTMLDivElement | null>(null);
 *
 *  const onResize= useCallback((domRect: DOMRect) => {
 *      // invoked whenever the div is resized
 *    }, [])
 *
 *  useResizeObserver(onResize, ref);
 *  return <div ref={setRef} />;
 * }
 * ```
 *
 * @param onChange - invoked with current element dimentions whenever the element is resized
 * @param domNode - should come from useState and NOT a useRef.current, otherwise updates will not
 * be observed
 */
export function useResizeObserver<T extends HTMLElement>(
  onChange: (rect: DOMRect) => void,
  domNode?: T | null
) {
  const [observer, setObserver] = useState<ResizeObserver | undefined>();

  useLayoutEffect(() => {
    if (!domNode) {
      return;
    }

    let co = observer;
    let canUpdate = true;
    if (!co) {
      co = singleEntryObserver((rect: DOMRect) => {
        canUpdate && onChange(rect);
      });
      setObserver(co);
    }
    co.disconnect();
    co.observe(domNode);

    return () => {
      canUpdate = false;
      co?.disconnect();
    };
  }, [domNode]);
}

function singleEntryObserver(onChange: (rect: DOMRect) => void) {
  return new CreateResizeObserver((entries) => {
    for (const entry of entries) {
      onChange(entry.target.getBoundingClientRect());
      if (entry) {
        break;
      }
    }
  });
}

export function _setResizeObserver(forTesting: typeof window.ResizeObserver) {
  CreateResizeObserver = forTesting;
}
