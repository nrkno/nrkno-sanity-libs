/**
 * @jest-environment jsdom
 */
import { DEFAULT_SANITY_CLIENT_VERSION, initPreview } from './iframe-preview';
import { MessageEvent } from './types';

interface QueryTestResult {
  id: string;
}

describe('iframe-preview', () => {
  let windowSpy: any;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should set default initial data during init (undefined)', () => {
    const setData = jest.fn();
    initPreview<QueryTestResult>({}, setData);
    expect(setData).toBeCalledWith(undefined);
  });

  it('should set provided initial data during init', () => {
    const setData = jest.fn();
    const initialData = { id: 'a' };
    initPreview<QueryTestResult>(
      {
        initialData,
      },
      setData
    );
    expect(setData).toBeCalledWith(initialData);
  });

  it('should add message event listener and remove it during cleanup', () => {
    const add = jest.fn();
    const remove = jest.fn();
    windowSpy.mockImplementation(() => ({
      addEventListener: add,
      removeEventListener: remove,
    }));

    const unmount = initPreview<QueryTestResult>({}, jest.fn());
    expect(add).toBeCalled();
    const listener = add.mock.calls[0][1];

    unmount();
    expect(remove).toBeCalledWith('message', listener);
  });

  it('should post ready and update messages during init', () => {
    const postMessage = jest.fn();
    windowSpy.mockImplementation(() => ({
      parent: { postMessage },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    initPreview<QueryTestResult>({}, jest.fn());

    expect(postMessage).toHaveBeenCalledTimes(2);

    const firstMessage = postMessage.mock.calls[0][0];
    expect(firstMessage).toEqual({ type: 'ready' });

    const secondMessage = postMessage.mock.calls[1][0];
    expect(secondMessage).toEqual({ type: 'updated' });
  });

  it('should post updated when listener receives data, and no groq-query is provided', async () => {
    const parentPostMessage = jest.fn();
    const addListener = jest.fn();
    windowSpy.mockImplementation(() => ({
      parent: { postMessage: parentPostMessage },
      addEventListener: addListener,
      removeEventListener: jest.fn(),
    }));

    const setData = jest.fn();
    initPreview<QueryTestResult>({}, setData);

    const id = 'document-id';
    const messageFromStudio: MessageEvent = {
      data: {
        // these fields are always included by the studio
        _id: id,
        _eventType: 'doc',
      },
    };

    // simulate Sanity studio posting message
    const messageCallback = addListener.mock.calls[0][1];
    messageCallback(messageFromStudio);

    // invoked first once with initial data
    await Promise.resolve();
    expect(setData).toBeCalledTimes(2);

    const secondSetData = setData.mock.calls[1][0];
    expect(secondSetData).toEqual(messageFromStudio.data);

    const messageAfterUpdating = parentPostMessage.mock.calls[2][0];
    expect(messageAfterUpdating).toEqual({ type: 'updated' });
  });

  it('should post groq-query when listener receives doc event', async () => {
    const parentPostMessage = jest.fn();
    const addListener = jest.fn();
    windowSpy.mockImplementation(() => ({
      parent: { postMessage: parentPostMessage },
      addEventListener: addListener,
      removeEventListener: jest.fn(),
    }));

    const setData = jest.fn();
    const groqQuery = "* [_type='my-page' && _id == $id]{_rev, ...}[0]";
    initPreview<QueryTestResult>(
      {
        groqQuery,
        queryParams: (doc) => ({ id: doc._id }),
      },
      setData
    );

    const id = 'document-id';
    const messageFromStudio: MessageEvent = {
      data: {
        // these fields are always included by the studio
        _id: id,
        _eventType: 'doc',
      },
    };

    // simulate Sanity studio posting message
    const messageCallback = addListener.mock.calls[0][1];
    messageCallback(messageFromStudio);

    // only invoked with initial data
    expect(setData).toBeCalledTimes(1);

    // wait for groq-query call to resolve
    await new Promise(process.nextTick);

    const messageAfterUpdating = parentPostMessage.mock.calls[2][0];
    expect(messageAfterUpdating).toEqual({
      type: 'groq',
      query: groqQuery,
      params: { id },
      clientVersion: DEFAULT_SANITY_CLIENT_VERSION,
    });
  });

  it('should set data when receiving groq-doc', async () => {
    const parentPostMessage = jest.fn();
    const addListener = jest.fn();
    windowSpy.mockImplementation(() => ({
      parent: { postMessage: parentPostMessage },
      addEventListener: addListener,
      removeEventListener: jest.fn(),
    }));

    const setData = jest.fn();
    const groqQuery = "* [_type='my-page' && _id == $id]{_rev, _id }[0]";
    initPreview<QueryTestResult>(
      {
        groqQuery,
        queryParams: (doc) => ({ id: doc._id }),
      },
      setData
    );

    const id = 'document-id';
    const messageFromStudio: MessageEvent = {
      data: {
        // these fields are always included by the studio
        _id: id,
        _eventType: 'groq-doc',
      },
    };

    // simulate Sanity studio posting message
    const messageCallback = addListener.mock.calls[0][1];
    messageCallback(messageFromStudio);

    await Promise.resolve();
    // invoked first once with initial data, then with result from groq-doc
    expect(setData).toBeCalledTimes(2);

    const secondSetData = setData.mock.calls[1][0];
    expect(secondSetData).toEqual(messageFromStudio.data);

    const messageAfterUpdating = parentPostMessage.mock.calls[2][0];
    expect(messageAfterUpdating).toEqual({ type: 'updated' });
  });
});
