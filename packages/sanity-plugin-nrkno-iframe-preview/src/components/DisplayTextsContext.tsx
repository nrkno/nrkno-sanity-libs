import { createContext } from 'react';

export interface DisplayTexts {
  retryLoading: string;
  documentNotSaved: string;
  makeEditToPreview: string;
  mobile: string;
  desktop: string;
  iframeTitle: string;
}

export const defaultDisplayTexts: DisplayTexts = {
  retryLoading: 'Retry',
  documentNotSaved: 'Document is not saved yet.',
  makeEditToPreview: 'Make an edit to enabled preview.',
  mobile: 'Mobile',
  desktop: 'Desktop',
  iframeTitle: 'Preview',
};

export const DisplayTextsContext = createContext<DisplayTexts>(defaultDisplayTexts);
