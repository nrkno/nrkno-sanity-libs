import React, {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SanityDocument, SourceClientOptions, useClient } from 'sanity';
import {
  PreviewAction,
  PreviewDocument,
  PreviewState,
  usePreviewReducer,
} from '../hooks/preview-reducer-hook';
import { useDebouncedEffect, useSetRefs } from '@snorreeb/nrkno-sanity-react-utils';
import { PreviewLoading } from './PreviewLoading';
import { BasicPreviewProps } from '../../sanity-types';
import { DisplayTextsContext } from '../DisplayTextsContext';
import {
  ensureRevision,
  registerIFramePreviewListener,
  resolveUrl,
  UrlResolver,
} from './preview-utils';
import { IFrame, PreviewDiv } from './IFramePreviewBasic.styled';
import { SanityClient } from '@sanity/client';

export interface IFramePreviewBasicOpts {
  /**
   * Iframe url.
   *
   *  Examples:
   *  * `'https://some-page.example/preview'`
   *  * `` (doc) => `https://some-page.example/${doc._id}` ``
   *  * `` (doc) => Promise.resolve(`https://some-page.example/${doc.slug.current}/preview`) ``
   * */
  url: UrlResolver;

  /** Transform the SanityDocument available to the previewComponent prior to sending it to the iframe.
   * After the iframe responds with a groq-event, this method will no longer be invoked.*/
  mapDocument?: (previewDocument: SanityDocument) => PreviewDocument | Promise<PreviewDocument>;

  /** When true, scroll in the iframe will be disabled */
  disableScroll?: boolean;

  /**
   * Minimum preview update time in milliseconds. Used to debounce document updates.
   *
   * After updateDelay has passed, the component will execute the current GROQ query every
   * <updateDelay> ms, until up-to-date data is returned, or until  maxRevisionRetries is reached.
   *
   * Default: 250 */
  updateDelay?: number;

  /**  Default: 5 */
  maxRevisionRetries?: number;
}

export interface IFramePreviewBasicProps extends BasicPreviewProps {
  children?: ReactNode | undefined;
  options: IFramePreviewBasicOpts;
}

const DEFAULT_UPDATE_DELAY = 250;
const DEFAULT_MAX_REVISION_RETRIES = 5;

interface IFramePreviewInternalProps extends IFramePreviewBasicProps {
  reload: () => void;
}

export const IFramePreviewBasic = forwardRef(function IFramePreviewBasic(
  props: IFramePreviewBasicProps,
  ref: ForwardedRef<HTMLIFrameElement>
) {
  if (!props.options?.url) {
    throw new Error('IFramePreview requires props.options.url to be a string or Promise<string> ');
  }

  const id = props.document?.displayed?._id;
  const [key, setKey] = useState(id);
  const reload = useCallback(() => setKey(`${Math.random()}`), []);
  useEffect(() => {
    if (id !== key) {
      setKey(id);
    }
  }, [id, key]);

  return (
    // eslint-disable-next-line no-use-before-define
    <IFramePreviewInternal {...props} key={key} reload={reload} ref={ref}>
      {props.children}
    </IFramePreviewInternal>
  );
});

let testableClient: any;

export function __setUseTestableClient(_testableClient: any) {
  testableClient = _testableClient;
}

export function useTestableClient(clientOptions?: SourceClientOptions): SanityClient {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return testableClient ? testableClient(clientOptions) : useClient(clientOptions);
}

const IFramePreviewInternal = forwardRef(function IFramePreview(
  props: IFramePreviewInternalProps,
  iframeRef: ForwardedRef<HTMLIFrameElement>
) {
  const sanityClient = useTestableClient({ apiVersion: '2022-01-01' });
  const [state, dispatch] = usePreviewReducer(sanityClient);
  const url = useUrl(props.options.url, props.document.displayed);

  const ref = useRef<HTMLIFrameElement | null>(null);
  useIframeMessageListener(dispatch);
  useUpdatedPreviewDoc(props.document.displayed, props.options, state, dispatch);
  useUpdatedIframe(state, dispatch, ref, url);
  const { iframeTitle } = useContext(DisplayTextsContext);

  const [anyButtonPressed, mouseListener] = useMouseButtonListener();

  const setRefs = useSetRefs(ref, iframeRef);

  return (
    <PreviewDiv
      onMouseEnter={mouseListener}
      onMouseOver={mouseListener}
      onMouseLeave={mouseListener}
    >
      <PreviewLoading
        loading={state.loading}
        documentId={props.document?.displayed?._id}
        reload={props.reload}
      />
      <IFrame
        ready={state.iframeReady}
        scrolling={props.options.disableScroll ? 'no' : undefined}
        style={{ pointerEvents: anyButtonPressed ? 'none' : 'auto' }}
        ref={setRefs}
        title={iframeTitle}
        src={url}
      />
      {props.children}
    </PreviewDiv>
  );
});

function useUrl(urlResolveer: UrlResolver, document?: SanityDocument) {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let canUpdate = true;
    resolveUrl(urlResolveer, document).then((newUrl) => {
      if (!canUpdate) {
        return;
      }
      if (newUrl !== url) {
        setUrl(newUrl);
      }
    });

    return () => {
      canUpdate = false;
    };
  }, [url, urlResolveer, document]);

  return url;
}

function useIframeMessageListener(dispatch: (action: PreviewAction) => void) {
  useEffect(() => {
    return registerIFramePreviewListener(dispatch, window);
  });
}

function useUpdatedPreviewDoc(
  document: SanityDocument | undefined,
  {
    mapDocument,
    updateDelay = DEFAULT_UPDATE_DELAY,
    maxRevisionRetries = DEFAULT_MAX_REVISION_RETRIES,
  }: IFramePreviewBasicProps['options'],
  { sanityClient, groq, iframeReady }: PreviewState,
  dispatch: (action: PreviewAction) => void
) {
  const displayedDoc = document;
  const revision = document?._rev ?? '';

  useEffect(() => {
    if (!iframeReady || !revision) {
      return;
    }
    dispatch({ type: 'WAIT_FOR_UPDATE' });
  }, [revision, iframeReady]);

  useDebouncedEffect(
    () => {
      if (!groq || !iframeReady || !displayedDoc) {
        return;
      }

      const { cancel } = ensureRevision(
        sanityClient,
        dispatch,
        groq,
        revision,
        maxRevisionRetries,
        updateDelay
      );
      // eslint-disable-next-line consistent-return
      return cancel;
    },
    [displayedDoc, sanityClient, groq, iframeReady, revision, maxRevisionRetries],
    updateDelay * 2
  );

  useDebouncedEffect(
    () => {
      if (groq || !iframeReady || !displayedDoc) {
        return;
      }
      let canUpdate = true;

      let doc: PreviewDocument | Promise<PreviewDocument> = displayedDoc;
      if (mapDocument) {
        doc = mapDocument(displayedDoc);
      }

      Promise.resolve(doc).then(
        (previewDocument) =>
          canUpdate &&
          dispatch({
            type: 'PREVIEW_DOC_UPDATED',
            previewDocument: { ...previewDocument, _id: displayedDoc._id },
          })
      );

      // eslint-disable-next-line consistent-return
      return () => {
        canUpdate = false;
      };
    },
    [mapDocument, displayedDoc, groq, iframeReady],
    updateDelay
  );
}

function useUpdatedIframe(
  { previewDocument, groq }: PreviewState,
  dispatch: (action: PreviewAction) => void,
  ref: MutableRefObject<HTMLIFrameElement | null>,
  url?: string
) {
  useEffect(() => {
    if (previewDocument && url) {
      const message = {
        _eventType: groq ? 'groq-doc' : 'doc',
        ...previewDocument,
      };
      ref.current?.contentWindow?.postMessage(message, new URL(url).origin);
    }
  }, [ref, previewDocument, groq, url]);
}

function useMouseButtonListener() {
  const [anyButtonPressed, setAnyButtonPressed] = useState<boolean>(false);
  const mouseListener = useCallback(
    (e: any) => {
      const anyPressed = !!e.buttons;
      if (anyPressed !== anyButtonPressed) {
        setAnyButtonPressed(anyPressed);
      }
    },
    [anyButtonPressed]
  );
  return [anyButtonPressed, mouseListener] as [typeof anyButtonPressed, typeof mouseListener];
}
