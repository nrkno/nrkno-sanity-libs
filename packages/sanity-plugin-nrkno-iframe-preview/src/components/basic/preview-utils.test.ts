import { SanityDocument } from '@sanity/types';
import { SanityClient } from '@sanity/client';
import {
  ensureRevision,
  IFrameEvent,
  ListenContainer,
  registerIFramePreviewListener,
  resolveUrl,
} from './preview-utils';
import { PreviewAction, PreviewQuery } from '../hooks/preview-reducer-hook';

describe('preview-utils', () => {
  describe('resolveUrl', () => {
    it('should resolve string', async () => {
      const expectedUrl = 'http://wherever.example';
      const url = await resolveUrl(expectedUrl, createDoc());
      expect(url).toEqual(expectedUrl);
    });

    it('should resolve Promise with string', async () => {
      const expectedUrl = 'http://wherever.example';
      const url = await resolveUrl(Promise.resolve(expectedUrl), createDoc());
      expect(url).toEqual(expectedUrl);
    });

    it('should resolve string with id', async () => {
      const doc = createDoc({ id: 'id' });
      const url = await resolveUrl((docArg) => docArg._id, doc);
      expect(url).toEqual(doc._id);
    });

    it('should resolve Promise with string with id', async () => {
      const doc = createDoc({ id: 'id' });
      const url = await resolveUrl((docArg) => Promise.resolve(docArg._id), doc);
      expect(url).toEqual(doc._id);
    });
  });

  describe('registerIFramePreviewListener', () => {
    let cleanup: () => void;
    let messageListener: (e: IFrameEvent) => void;
    let dispatch: (action: PreviewAction) => void;
    let mockWindow: {
      addEventListener: jest.Mock<ListenContainer['addEventListener']>;
      removeEventListener: jest.Mock<ListenContainer['removeEventListener']>;
    };
    beforeEach(() => {
      dispatch = jest.fn();
      mockWindow = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      cleanup = registerIFramePreviewListener(dispatch, mockWindow);
      messageListener = mockWindow.addEventListener.mock.calls[0][1];
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should register messageListener and return cleanup function (remove messageListener)', async () => {
      expect(mockWindow.addEventListener).toHaveBeenCalled();
      expect(mockWindow.removeEventListener).not.toHaveBeenCalled();
      cleanup();
      expect(mockWindow.removeEventListener).toHaveBeenCalled();
    });

    it('should dispatch READY when receiving ready events (legacy style and object)', async () => {
      const ready: PreviewAction = { type: 'READY' };

      messageListener({ data: 'ready' });
      expect(dispatch).toHaveBeenCalledWith(ready);

      messageListener({ data: { type: 'ready' } });
      expect(dispatch).toHaveBeenCalledWith(ready);
    });

    it('should dispatch IFRAME_UPDATED when receiving updated events (legacy style and object)', async () => {
      const ready: PreviewAction = { type: 'IFRAME_UPDATED' };

      messageListener({ data: 'updated' });
      expect(dispatch).toHaveBeenCalledWith(ready);

      messageListener({ data: { type: 'updated' } });
      expect(dispatch).toHaveBeenCalledWith(ready);
    });

    it('should dispatch GROQ when receiving groq event', async () => {
      const iframeEvent: { data: PreviewQuery } = {
        data: {
          type: 'groq',
          query: '* [_id == $id][0] {_rev, ...}',
          params: { id: 'id' },
          apiVersion: 'X',
        },
      };

      const action: PreviewAction = {
        type: 'GROQ',
        groq: iframeEvent.data,
      };

      messageListener(iframeEvent);
      expect(dispatch).toHaveBeenCalledWith(action);
    });

    it('should insert _rev in query when its missing', async () => {
      const iframeEvent: { data: PreviewQuery } = {
        data: {
          type: 'groq',
          query: '* [_id == $id][0] {...}',
          params: { id: 'id' },
          apiVersion: 'X',
        },
      };

      const action: PreviewAction = {
        type: 'GROQ',
        groq: {
          ...iframeEvent.data,
          query: '* [_id == $id][0] {_rev,...}',
        },
      };

      messageListener(iframeEvent);
      expect(dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe('ensureRevision', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
    });

    it('should retry fetch when result has stale revision', async () => {
      const fetch = jest.fn();
      const mockClient: Pick<SanityClient, 'fetch'> = {
        fetch,
      };

      const waitForThisRevision = '2';
      const results = [
        { _id: 'id', _rev: '1' },
        { _id: 'id', _rev: waitForThisRevision },
      ];
      let invocation = 0;
      fetch.mockImplementation(() => Promise.resolve(results[invocation++]));

      const dispatch = jest.fn();
      const result = ensureRevision(
        mockClient,
        dispatch,
        { type: 'groq', query: '*{_rev}[0]', params: {} },
        waitForThisRevision,
        2,
        200
      );

      expect(invocation).toEqual(1);
      expect(dispatch).not.toHaveBeenCalled();
      Promise.resolve().then(() => jest.advanceTimersByTime(300));
      await result.taskResult;
      const expectedAction: PreviewAction = {
        type: 'PREVIEW_DOC_UPDATED',
        previewDocument: results[1],
      };
      expect(dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should cancel ensure revision task', async () => {
      const fetch = jest.fn();
      const mockClient: Pick<SanityClient, 'fetch'> = {
        fetch,
      };

      fetch.mockImplementation(() => Promise.resolve(null));

      const dispatch = jest.fn();
      const result = ensureRevision(
        mockClient,
        dispatch,
        { type: 'groq', query: '*{_rev}[0]', params: {} },
        'anyRev',
        3,
        200
      );

      Promise.resolve().then(() => jest.advanceTimersByTime(700));
      result.cancel();
      await result.taskResult;
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});

function createDoc(overrides?: Partial<SanityDocument>): SanityDocument {
  return {
    _id: 'id',
    _type: 'any',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'rev',
    ...overrides,
  };
}
