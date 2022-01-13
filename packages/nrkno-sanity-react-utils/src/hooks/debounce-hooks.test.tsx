import { render } from '@testing-library/react';
import React from 'react';
import { useDebouncedEffect } from './debouce-hooks';

describe('debounce-hooks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('useDebouncedEffect', () => {
    it('should only invoke effect with the last dependencies applied during delay', () => {
      const testEffect = jest.fn();
      const { rerender } = render(<Test testEffect={testEffect} dependency={'first'} />);
      rerender(<Test testEffect={testEffect} dependency={'second'} />);
      rerender(<Test testEffect={testEffect} dependency={'used-for-effect'} />);

      jest.runAllTimers();

      expect(testEffect).toHaveBeenCalledTimes(1);
      expect(testEffect).toHaveBeenCalledWith('used-for-effect');
    });

    it('should invoke cleanup function only for invoked functions', () => {
      const testCleanup = jest.fn();
      const testEffect = (dep: string) => {
        return () => testCleanup(dep);
      };
      const { rerender } = render(<Test testEffect={testEffect} dependency={'first'} />);
      rerender(<Test testEffect={testEffect} dependency={'used-for-effect'} />);
      jest.runAllTimers();

      rerender(<Test testEffect={testEffect} dependency={'changing-dep-should-invoke-cleanup'} />);
      jest.runAllTimers();
      expect(testCleanup).toHaveBeenCalledTimes(1);
      expect(testCleanup).toHaveBeenCalledWith('used-for-effect');
    });
  });
});

function Test({
  testEffect,
  dependency,
}: {
  testEffect: (dep: string) => void;
  dependency: string;
}) {
  useDebouncedEffect(() => testEffect(dependency), [dependency, testEffect], 500);
  return null;
}
