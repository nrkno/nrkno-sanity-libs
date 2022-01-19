import { useReducer } from 'react';
import { SanityClient } from '@sanity/client';

export interface PreviewDocument {
  _id: string;
  [key: string]: unknown;
}

export interface PreviewState {
  previewDocument?: PreviewDocument;
  iframeReady: boolean;
  loading: boolean;
  groq?: PreviewQuery;
  sanityClient: SanityClient;
}

interface FrameReadyAction {
  type: 'READY';
}

interface GroqAction {
  type: 'GROQ';
  groq: PreviewQuery;
}

export interface PreviewQuery {
  type: 'groq';
  query: string;
  params: Record<string, unknown>;
  clientVersion?: string; // used by iframe-api
  apiVersion?: string; // legacy
}

interface WaitAction {
  type: 'WAIT_FOR_UPDATE';
}

interface FrameUpdatedAction {
  type: 'IFRAME_UPDATED';
}

interface PreviewDocUpdatedAction {
  type: 'PREVIEW_DOC_UPDATED';
  previewDocument: PreviewDocument;
}

export type PreviewAction =
  | FrameReadyAction
  | GroqAction
  | WaitAction
  | FrameUpdatedAction
  | PreviewDocUpdatedAction;

export function initialState(sanityClient: SanityClient) {
  return {
    iframeReady: false,
    loading: true,
    sanityClient,
  };
}

export function usePreviewReducer(sanityClient: SanityClient) {
  function previewReducer(state: PreviewState, action: PreviewAction): PreviewState {
    switch (action.type) {
      case 'READY':
        return {
          ...state,
          iframeReady: true,
        };
      case 'GROQ':
        return {
          ...state,
          previewDocument: undefined,
          groq: action.groq,
          sanityClient: sanityClient.withConfig({
            apiVersion: action.groq.clientVersion ?? action.groq.apiVersion ?? '2021-11-01',
          }),
        };
      case 'WAIT_FOR_UPDATE':
        return {
          ...state,
          loading: true,
        };
      case 'PREVIEW_DOC_UPDATED':
        return {
          ...state,
          previewDocument: action.previewDocument,
        };
      case 'IFRAME_UPDATED':
        return {
          ...state,
          loading: false,
        };
      default:
        return state;
    }
  }

  return useReducer(previewReducer, initialState(sanityClient));
}
