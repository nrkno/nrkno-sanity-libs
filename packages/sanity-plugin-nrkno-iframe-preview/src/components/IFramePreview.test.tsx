import { render } from '@testing-library/react';
import React from 'react';
import { IFramePreview } from './IFramePreview';
import { SanityDocument } from '@sanity/types';
import { defaultDisplayTexts, DisplayTexts, DisplayTextsContext } from './DisplayTextsContext';
import { studioTheme, ThemeProvider } from '@sanity/ui';

jest.mock('part:@sanity/base/client', () => ({
  default: jest.fn(),
}));

describe('IFramePreview', () => {
  it('should render iframe', async () => {
    const doc = createSanityDoc('id');
    const result = render(
      <ThemeProvider theme={studioTheme}>
        <IFramePreview
          documentId={doc._id}
          document={{ displayed: doc }}
          options={{
            url: 'http://nowhere.example',
          }}
        />
      </ThemeProvider>
    );
    const iframeElement = await result.findByTitle(defaultDisplayTexts.iframeTitle);
    expect(iframeElement).toBeDefined();

    // dont show controls when desktopMinWidth is unspecified
    const mobileButton = await result.queryByText(defaultDisplayTexts.mobile);
    expect(mobileButton).toBeNull();
  });

  it('should render controls', async () => {
    const doc = createSanityDoc('id');
    const result = render(
      <ThemeProvider theme={studioTheme}>
        <IFramePreview
          documentId={doc._id}
          document={{ displayed: doc }}
          options={{
            url: 'http://nowhere.example',
            desktopMinWidth: 900,
          }}
        />
      </ThemeProvider>
    );
    const mobileButton = await result.findByText(defaultDisplayTexts.mobile);
    expect(mobileButton).toBeDefined();
    const desktopButton = await result.findByText(defaultDisplayTexts.desktop);
    expect(desktopButton).toBeDefined();
  });

  it('should use provided display texts', async () => {
    const doc = createSanityDoc('id');

    const texts: DisplayTexts = {
      ...defaultDisplayTexts,
      iframeTitle: 'Changed preview Title',
    };

    const result = render(
      <ThemeProvider theme={studioTheme}>
        <DisplayTextsContext.Provider value={texts}>
          <IFramePreview
            documentId={doc._id}
            document={{ displayed: doc }}
            options={{
              url: 'http://nowhere.example',
            }}
          />
        </DisplayTextsContext.Provider>
      </ThemeProvider>
    );
    const iframeElement = await result.findByTitle(texts.iframeTitle);
    expect(iframeElement.title).toEqual(texts.iframeTitle);
  });
});

function createSanityDoc(id: string): SanityDocument {
  return {
    _id: id,
    _type: 'any-town-usa',
    _rev: 'rev',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  };
}
