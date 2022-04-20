import { render } from '@testing-library/react';
import React, { useState } from 'react';
import { _setResizeObserver, useResizeObserver } from './resize-observer';

describe('resize-observer', () => {
  let currentObserver: ResizeObserver;
  let currentCallback: ResizeObserverCallback;

  beforeEach(() => {
    const MockObserver: typeof window.ResizeObserver = class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        currentCallback = callback;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        currentObserver = this;
      }
      public disconnect = jest.fn();
      public observe = jest.fn();
      public unobserve = jest.fn();
    };
    _setResizeObserver(MockObserver);
  });

  afterEach(() => {
    _setResizeObserver(window.ResizeObserver);
  });

  it('should invoke onchange when domNode changes size', function () {
    const onChange = jest.fn();
    render(<Test onChange={onChange} />);

    expect(currentObserver.disconnect).toHaveBeenCalledTimes(1);
    expect(currentObserver.observe).toHaveBeenCalledTimes(1);

    const mockRect: DOMRect = {
      height: 1,
      width: 1,
      bottom: 1,
      top: 0,
      left: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON(): any {
        return '';
      },
    };

    currentCallback(
      [
        {
          target: {
            getBoundingClientRect() {
              return mockRect;
            },
          } as unknown as HTMLDivElement,
          contentRect: mockRect,
          contentBoxSize: [], // unused in tests
          borderBoxSize: [], // unused in tests
          devicePixelContentBoxSize: [], // unused in tests
        },
      ],
      undefined as unknown as ResizeObserver
    );

    expect(onChange).toHaveBeenCalledWith(mockRect);
  });
});

function Test(props: { onChange: (rect: DOMRect) => void }) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useResizeObserver(props.onChange, ref);
  return <div ref={setRef} />;
}
