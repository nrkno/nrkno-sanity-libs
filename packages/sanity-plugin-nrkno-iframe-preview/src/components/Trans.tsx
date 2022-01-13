import React from 'react';
import {
  defaultDisplayTexts,
  DisplayTexts,
  DisplayTextsContext,
  IFramePreview,
  IFramePreviewProps,
} from '../index';

const texts: DisplayTexts = {
  ...defaultDisplayTexts,
  iframeTitle: 'Changed preview title',
};

export function TranslatedIFramePreview(props: IFramePreviewProps) {
  return (
    <DisplayTextsContext.Provider value={texts}>
      <IFramePreview {...props} />
    </DisplayTextsContext.Provider>
  );
}
