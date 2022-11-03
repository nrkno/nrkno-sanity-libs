import { PreviewConfig, MessageEvent } from './types';

type Logger = typeof console.log;
export const DEFAULT_SANITY_CLIENT_VERSION = '2021-06-01';

/**
 * ## Usage
 * ```ts
 * import { initPreview } from '\@nrk/sanity-plugin-nrkno-iframe-preview'
 *
 * // Somewhere after page load
 * const unloadPreview = initPreview<QueryResult | undefined>(
 *   {
 *        sanityClientVersion: "2021-06-01",
 *        // groq SHOULD contain _rev-field projected at the top level
 *        // if it is not, IFramePreview in Sanity Studio will try to modify the query to include it.
 *        groqQuery: "* [_type='my-page' && _id == $id]{_rev, ...}[0]",
 *        queryParams: (doc) => ({id: doc._id}), // default
 *        initialData: prefetchedData
 *    },
 *   (data) => {
 *        // When this page is loaded by IFramePreview in Sanity Studio,
 *        // this callback will receive updated data whenever the Studio makes edits.
 *
 *        // If groqQuery was provided, the data will conform to the query
 *        // If groqQuery was omitted, the data will be the current Studio document
 *
 *        // Use it to update your page in whatever way makes sense.
 *    }
 * )
 *
 * // ... later
 * // whenever the component that uses the preview is unmounted, ensure to call
 * unloadPreview()
 * ```
 */
export function initPreview<T>(
  {
    origin = '*',
    groqQuery,
    sanityClientVersion,
    queryParams = (d) => ({ id: d._id }),
    initialData,
    debug = false,
  }: PreviewConfig<T>,
  setData: (data: T | undefined) => void | Promise<void>
) {
  const logger = createDebugLogger(debug);
  const setDataInner = setData;
  setData = (data: T | undefined) => {
    logger('Invoking setData with:', data);
    return setDataInner(data);
  };

  logger('Initializing iframe preview using config:', {
    origin,
    groqQuery,
    sanityClientVersion,
    queryParams,
    initialData,
    debug,
  });

  function postMessage(messageType: 'ready' | 'updated', origin: string) {
    const message = { type: messageType };
    logger('Send message', message);
    window.parent?.postMessage(message, origin);
  }

  function sendGROQ(
    groqQuery: PreviewConfig<unknown>['groqQuery'],
    params: Record<string, unknown>,
    sanityClientVersion = DEFAULT_SANITY_CLIENT_VERSION,
    origin: string
  ) {
    const resolveQuery = typeof groqQuery === 'function' ? groqQuery() : groqQuery;
    Promise.resolve(resolveQuery)
      .then((query) => {
        if (!query || !query.includes('_rev')) {
          throw new Error(
            `Invalid groq-message. Query MUST contain _rev as a projected field ala {_rev, ...}. Please refer to the docs at https://github.com/nrkno/nrkno-sanity-libs/tree/master/packages/nrkno-iframe-preview-api#about-the-_rev-field\n
            Query was:\n${query}`
          );
        }
        const message = { type: 'groq', query: query, params, clientVersion: sanityClientVersion };
        logger('Send groq message', message);
        window.parent?.postMessage(message, origin);
      })
      .catch((e) => {
        logger('Failed to resolve groqQuery', e);
        throw e;
      });
  }

  function createMessageListener() {
    return async (event: MessageEvent) => {
      const eventType = event.data._eventType;
      logger('Receive message', event.data);

      if (!eventType) {
        logger('Warning: received message without eventType. This is unexpected.');
        return;
      }
      if (eventType === 'doc') {
        if (!groqQuery) {
          // When no groqQuery is configured, just use the document provided by
          // Sanity Studio directly.
          await setData(event.data as unknown as T);
          return postMessage('updated', origin);
        }

        return sendGROQ(groqQuery, queryParams(event.data), sanityClientVersion, origin);
      }

      if (eventType === 'groq-doc') {
        await setData(event.data as unknown as T);
        return postMessage('updated', origin);
      }
    };
  }

  const eventListener = createMessageListener();
  window.addEventListener('message', eventListener, false);

  // Sanity Studio will not send previewDoc before this event has been sent
  postMessage('ready', origin);

  setData(initialData);

  // removes spinner in Sanity Studio
  postMessage('updated', origin);

  return () => {
    logger('Removing iframe-preview window message listener.');
    window.removeEventListener('message', eventListener);
  };
}

function createDebugLogger(debug: PreviewConfig<unknown>['debug']): Logger {
  return debug ? (typeof debug === 'function' ? debug : createDefaultLogger()) : () => {};
}

function createDefaultLogger() {
  return (message?: any, ...optionalParams: any[]) =>
    // eslint-disable-next-line no-console
    console.log('%c iframe-preview-api', 'color: blue', message, ...optionalParams);
}
