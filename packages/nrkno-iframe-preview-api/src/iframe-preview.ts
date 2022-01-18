import { PreviewConfig, MessageEvent } from './types';

export const DEFAULT_SANITY_CLIENT_VERSION = '2021-06-01';

/**
 *
 * ## Usage
 * ```ts
 * import { initPreview } from '@nrk/sanity-plugin-nrkno-iframe-preview'
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
  }: PreviewConfig<T>,
  setData: (data: T | undefined) => void
) {
  function createMessageListener() {
    return async (event: MessageEvent) => {
      const id = event.data._id;
      const eventType = event.data._eventType;

      if (!id || !eventType) {
        return;
      }
      if (eventType === 'doc') {
        if (!groqQuery) {
          // When no groqQuery is configured, just use the document provided by
          // Sanity Studio directly.
          setData(event.data as unknown as T);
          return postMessage('updated', origin);
        }

        return sendGROQ(groqQuery, queryParams(event.data), sanityClientVersion, origin);
      }

      if (eventType === 'groq-doc') {
        setData(event.data as unknown as T);
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

  return () => window.removeEventListener('message', eventListener);
}

function postMessage(messageType: 'ready' | 'updated', origin: string) {
  window.parent?.postMessage({ type: messageType }, origin);
}

function sendGROQ(
  groqQuery: PreviewConfig<unknown>['groqQuery'],
  params: Record<string, unknown>,
  sanityClientVersion = DEFAULT_SANITY_CLIENT_VERSION,
  origin: string
) {
  const resolveQuery = typeof groqQuery === 'function' ? groqQuery() : groqQuery;
  Promise.resolve(resolveQuery).then((query) => {
    if (!query || !query.includes('_rev')) {
      throw new Error(
        `Invalid groq-message. Query MUST contain _rev as a projected field ala {_rev, ...}. Please refer to the docs. Query was: ${query}`
      );
    }

    window.parent?.postMessage(
      {
        type: 'groq',
        query: query,
        params,
        clientVersion: sanityClientVersion,
      },
      origin
    );
  });
}
