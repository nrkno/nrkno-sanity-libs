import { render } from '@testing-library/react';
import React, { ForwardedRef, forwardRef, MutableRefObject } from 'react';
import { useSetRefs } from './set-refs-hook';

describe('set-refs-hook', () => {
  it('should set all refs', () => {
    let fnRef: HTMLDivElement | null = null;
    const innerFnRef: ForwardedRef<HTMLDivElement | undefined> = (ref: HTMLDivElement | null) => {
      fnRef = ref;
    };
    const innerObjectRef: MutableRefObject<HTMLDivElement | null> = { current: null };
    const forwardedRef = jest.fn();

    function Test(props: any, forwardRef: ForwardedRef<HTMLDivElement>) {
      const setRefs = useSetRefs(forwardRef, innerObjectRef, innerFnRef);
      return <div ref={setRefs} />;
    }

    const ForwardTest = forwardRef(Test);

    function UseForward() {
      return <ForwardTest ref={forwardedRef} />;
    }

    render(<UseForward />);

    expect(innerObjectRef.current).toBeDefined();
    expect(fnRef).toBeDefined();
    expect(forwardedRef).toHaveBeenCalled();
  });
});
