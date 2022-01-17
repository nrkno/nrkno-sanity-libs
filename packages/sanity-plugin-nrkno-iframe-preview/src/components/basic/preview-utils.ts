import { SanityClient } from '@sanity/client';
import { SanityDocument } from '@sanity/types';
import { PreviewAction, PreviewDocument, PreviewQuery } from '../hooks/preview-reducer-hook';

export type UrlResolver =
  | string
  | Promise<string>
  | ((previewDocument: SanityDocument) => string)
  | ((previewDocument: SanityDocument) => Promise<string>);

export type ListenContainer = Pick<typeof window, 'addEventListener' | 'removeEventListener'>;

export interface IFrameEvent {
  data?: { type: string } | string;
}

export async function resolveUrl(
  urlResolver: UrlResolver,
  document?: SanityDocument
): Promise<string | undefined> {
  if (!document) {
    return;
  }

  const resolveUrl = typeof urlResolver === 'function' ? urlResolver(document) : urlResolver;
  return Promise.resolve(resolveUrl);
}

export function registerIFramePreviewListener(
  dispatch: (action: PreviewAction) => void,
  container: ListenContainer
) {
  const listener = (e: IFrameEvent) => {
    const eventType = typeof e.data === 'string' ? e.data : e.data?.type;
    if (eventType === 'ready') {
      dispatch({ type: 'READY' });
    } else if (eventType === 'groq') {
      let queryData = e.data as PreviewQuery;
      if (!queryData.query.includes('_rev')) {
        // We need the _rev field, so do a cheeky insert and hope for the best.
        // this is needed to fix legacy queries without _rev
        if (!queryData.query.includes('{')) {
          throw new Error(
            `Invalid groq-message. Query MUST contain { and SHOULD contain _rev. Please refer to the docs. Query was: ${queryData.query}`
          );
        }
        queryData = {
          ...queryData,
          query: queryData.query.replace('{', '{_rev,'),
        };
      }
      dispatch({ type: 'GROQ', groq: queryData });
    } else if (eventType === 'updated') {
      dispatch({ type: 'IFRAME_UPDATED' });
    }
  };
  container.addEventListener('message', listener, false);
  return () => container.removeEventListener('message', listener);
}

export function ensureRevision(
  sanityClient: Pick<SanityClient, 'fetch'>,
  dispatch: (action: PreviewAction) => void,
  groq: PreviewQuery,
  revision: string,
  maxRevisionRetries: number,
  updateDelay: number
) {
  let canUpdate = true;
  const cancel = () => {
    canUpdate = false;
  };

  const taskResult = new Promise<PreviewDocument | undefined>((resolve) => {
    const _ensureRevision = (tries = 0) => {
      sanityClient.fetch(groq.query, groq.params).then((previewDocument) => {
        if (!canUpdate) {
          resolve(undefined);
          return;
        }

        const rev = previewDocument._rev;
        const isUpdated = !revision || !rev || revision === rev;
        const giveUp = tries >= maxRevisionRetries;
        if (isUpdated || giveUp) {
          dispatch({ type: 'PREVIEW_DOC_UPDATED', previewDocument });
          resolve(previewDocument);
        } else {
          tries++;
          setTimeout(() => _ensureRevision(tries), updateDelay);
        }
      });
    };
    _ensureRevision();
  });

  return {
    taskResult,
    cancel,
  };
}
