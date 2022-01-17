import React from 'react';
import { SanityClient } from '@sanity/client';
import {
  initialState,
  PreviewAction,
  PreviewState,
  usePreviewReducer,
} from './preview-reducer-hook';
import { Dispatch } from 'react';
import { act, render } from '@testing-library/react';

describe('preview-reducer-hook', () => {
  let sanityClient: SanityClient;
  let lastState: PreviewState;
  let lastDispatch: Dispatch<PreviewAction>;
  beforeEach(() => {
    sanityClient = {
      withConfig: jest.fn(),
    } as unknown as SanityClient;
  });

  function Test() {
    const [state, dispatch] = usePreviewReducer(sanityClient);
    lastState = state;
    lastDispatch = dispatch;
    return null;
  }

  it('should have initial state', () => {
    render(<Test />);
    expect(lastState).toEqual(initialState(sanityClient));
  });

  it('should set iframeReady for READY', () => {
    render(<Test />);
    act(() => lastDispatch({ type: 'READY' }));
    expect(lastState).toEqual({
      ...initialState(sanityClient),
      iframeReady: true,
    });
  });

  it('should set loading false for IFRAME_UPDATED', () => {
    render(<Test />);
    act(() => lastDispatch({ type: 'IFRAME_UPDATED' }));
    expect(lastState).toEqual({
      ...initialState(sanityClient),
      loading: false,
    });
  });

  it('should set loading true for WAIT_FOR_UPDATE', () => {
    render(<Test />);
    act(() => lastDispatch({ type: 'IFRAME_UPDATED' }));
    act(() => lastDispatch({ type: 'WAIT_FOR_UPDATE' }));
    expect(lastState).toEqual({
      ...initialState(sanityClient),
      loading: true,
    });
  });

  it('should set previewDoc for PREVIEW_DOC_UPDATED', () => {
    render(<Test />);
    const doc = { _id: 'id' };
    act(() => lastDispatch({ type: 'PREVIEW_DOC_UPDATED', previewDocument: doc }));
    expect(lastState).toEqual({
      ...initialState(sanityClient),
      previewDocument: doc,
    });
  });

  it('should set groq for GROQ and unset previewDoc', () => {
    render(<Test />);
    const event: PreviewAction = {
      type: 'GROQ',
      groq: {
        type: 'groq',
        query: '*[_id == $id]{_rev,...}',
        params: { id: 'id' },
      },
    };
    act(() => lastDispatch(event));
    expect(lastState).toEqual({
      ...initialState(sanityClient),
      previewDocument: undefined,
      groq: event.groq,
      sanityClient: undefined, // mocked return value
    });
  });
});
