# @nrk/nrkno-sanity-react-utils

Various React related utility functions and libs used by nrkno-sanity.

# Installation

`npm install --save @nrk/nrkno-sanity-react-utils`

# Usage

## useSetRefs

Callback that sets all provided refs. Useful when you need multiple reference handles to the same component.

For instance, a ref for your local state and for forwarded Sanity ref in custom input component.

```tsx
function SomeComponent(props: any, forwardRef: ForwardedRef<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement | null>(null)
  const setRefs = useSetRefs(ref, forwardRef);
  return <div ref={setRefs} />;
}
```

## useResizeObserver

Get a callback whenever an observed element changes size.

```tsx
function SomeComponent() {
 //useState and NOT useRef
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const onResize= useCallback((domRect: DOMRect) => {
      // invoked whenever the div is resized
    }, [])
    
  useResizeObserver(onResize, ref);
  return <div ref={setRef} />;
}
```

## useDebouncedEffect

Takes an effect callback and dependency array like {@link useEffect}.

When dependencies change (including component mount, ala useEffect),
the effect will be invoked after <delay> milliseconds.

The effect is debounced:
Delay restarts whenever dependencies change, and only the last
change to dependencies will be used.

```ts
function SomeComponent({prop}: {prop: string}) {
    useDebouncedEffect(() => {
        // delays invoking this func until after 500 milliseconds have elapsed 
        // since the last time dependencies changed
    }, [prop], 500)
    return null;
}
```
