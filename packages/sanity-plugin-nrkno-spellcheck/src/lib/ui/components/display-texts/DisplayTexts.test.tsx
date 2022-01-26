import React from 'react';
import { render } from '@testing-library/react';
import {
  defaultDisplayTexts,
  DisplayTexts,
  DisplayTextsContext,
  useDisplayText,
} from './DisplayTexts';

describe('DisplayTexts', () => {
  it('should use default text for parameterized display text', () => {
    function Test() {
      return <div>{useDisplayText('acceptButtonText', 5)}</div>;
    }
    const result = render(<Test />);
    const acceptCorrections = defaultDisplayTexts.acceptButtonText(5) as string;
    expect(acceptCorrections).toEqual('Accept 5');
    expect(result.queryByText(acceptCorrections)).toBeTruthy();
  });

  it('should use parameterized display text from context', () => {
    function Test() {
      return <div>{useDisplayText('acceptButtonText', 2)}</div>;
    }

    const context: DisplayTexts = {
      ...defaultDisplayTexts,
      acceptButtonText: (acceptCount) => `Aksepter ${acceptCount}`,
    };
    const result = render(
      <DisplayTextsContext.Provider value={context}>
        <Test />
      </DisplayTextsContext.Provider>
    );
    const acceptCorrections = context.acceptButtonText(2) as string;
    expect(acceptCorrections).toEqual('Aksepter 2');
    expect(result.queryByText(acceptCorrections)).toBeTruthy();
  });
});
