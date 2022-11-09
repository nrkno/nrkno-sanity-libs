import { act, render, RenderResult } from '@testing-library/react';
import React from 'react';
import { studioTheme, ThemeProvider } from '@sanity/ui';
import { defaultDisplayTexts } from '../DisplayTextsContext';
import { SanityDocument } from 'sanity';
import { __setUseTestableClient, IFramePreviewBasic } from './IFramePreviewBasic';

__setUseTestableClient(jest.fn());

describe('IFramePreviewBasic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should resolve url', async () => {
    const doc = createSanityDoc('id');

    let result: RenderResult;
    await act(() => {
      result = render(
        <ThemeProvider theme={studioTheme}>
          <IFramePreviewBasic
            documentId={doc._id}
            document={{ displayed: doc }}
            options={{
              url: (d) => Promise.resolve(`http://goes-nowhere.example/preview/${d._id}`),
            }}
          />
        </ThemeProvider>
      );

      jest.runAllTimers();
      // will ensure all promises are resolved
      return Promise.resolve();
    });

    // @ts-expect-error result is set by act, but ts cant infer it
    const iframeElement = await result.findByTitle(defaultDisplayTexts.iframeTitle);
    expect(iframeElement).toBeDefined();
    const src = (iframeElement as HTMLIFrameElement).src;
    expect(src).toEqual('http://goes-nowhere.example/preview/id');
  });

  it('shows loading before receiving ready', async () => {
    const result = await renderBasicPreview();

    const retryButton = await result.findByText(defaultDisplayTexts.retryLoading);
    expect(retryButton).toBeDefined();
  });

  it('should add and remove message listener ', async () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');

    const result = await renderBasicPreview();
    const messageListener = addEventListener.mock.calls.find((c) => c[0] === 'message');
    if (!messageListener) {
      fail('messageListener was not defined');
      return;
    }
    const addedListener = messageListener[1];
    expect(addedListener).toBeDefined();

    act(() => {
      result.unmount();
    });

    const removeListener = removeEventListener.mock.calls.find((c) => c[0] === 'message');
    if (!removeListener) {
      fail('removeListener was not defined');
      return;
    }
    expect(removeEventListener).toBeCalledWith('message', addedListener);
  });

  it('should updated after message events', async () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const result = await renderBasicPreview();

    const messageListener = addEventListener.mock.calls.find((c) => c[0] === 'message');
    if (!messageListener) {
      fail('messageListener was not defined');
      return;
    }
    const addedListener = messageListener[1] as CallableFunction;

    await act(() => {
      // simulate target iframe loaded
      addedListener({ data: { type: 'ready' } });
      addedListener({ data: { type: 'updated' } });
      jest.runAllTimers();
      return Promise.resolve();
    });

    await act(() => {
      // at this point, studio has sendt current doc to iframe, which
      // should respond with groq or updated.
      addedListener({ data: { type: 'updated' } });
      jest.runAllTimers();
      return Promise.resolve();
    });

    const retryButton = await result.queryByText(defaultDisplayTexts.retryLoading);
    expect(retryButton).toBeNull();
  });
});

async function renderBasicPreview(): Promise<RenderResult> {
  const doc = createSanityDoc('id');
  let result: RenderResult | undefined;
  await act(() => {
    result = render(
      <ThemeProvider theme={studioTheme}>
        <IFramePreviewBasic
          documentId={doc._id}
          document={{ displayed: doc }}
          options={{ url: 'http://whatever.example' }}
        />
      </ThemeProvider>
    );

    jest.runAllTimers();
    // will ensure all promises are resolved
    return Promise.resolve();
  });

  if (!result) {
    throw new Error('failed to render');
  }

  return result;
}

function createSanityDoc(id: string): SanityDocument {
  return {
    _id: id,
    _type: 'any-town-usa',
    _rev: 'rev',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  };
}
