export interface PreviewConfig<T> {
  /**
   * Pre-fetched data, if any.
   *
   * Used until Sanity Studio sends the first document.
   */
  initialData?: T;

  /**
   * Groq-query to execute.
   *
   * *NOTE*: The query **MUST** include _rev as a projected field, ie:
   *
   * ```
   * *[_id == $id]{ _rev, ... }[0]
   * ```
   *
   * ## When provided
   * The iframe will request that Sanity Studio post the result
   * of the query to the preview-app, whenever the document changes in the Studio.
   *
   * Supports function and/or promise to allow the use of dynamic import to load the groq-query, for instance.
   *
   * ## When omitted
   * The iframe will receive the Sanity document as is from the Studio,
   * whenever it changes (after being mapped by mapDocument in the IFramePreview component).
   *
   */
  groqQuery?: string | Promise<string> | (() => string) | (() => Promise<string>);

  /**
   * Function to pick params to use in the query,
   * based on the last document received from Sanity Studio.
   *
   * Default: (studioDoc) => ({ id: studioDoc._id})
   */
  queryParams?: (studioDoc: StudioDocument) => Record<string, unknown>;

  /**
   * Sanity Studio will use this version when provided, otherwise the default
   * Studio client version will be used.
   */
  sanityClientVersion?: string;

  /**
   * Default: '*'
   *
   * Consider changing this if your groq-query string contains sensitive data.
   *
   * If window.parent.postMessage is intercepted, only groqQuery-string will
   * leak. No actual data is passed from the iframe back to the Studio.
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#syntax passed to postMessage targetOrigin}
   */
  origin?: string;

  /**
   * When true, the iframe-api-code will log debug-messages in console.log.
   *
   * This is useful to determine why the preview is not working correctly (spinner not disappearing ect),
   * or to get insight into the message-flow between the Studio and iframe.
   *
   * Since the iframe is embedded in Sanity Studio, these messages will appear in the
   * browser console of the Studio. IFramePreview can be configured to emit debug-logs separately.
   *
   * debug can also be a function conforming to console.log signature.
   * The function will be used in place of console.log.
   *
   */
  debug?: boolean | typeof console.log;
}

export interface StudioDocument {
  _id?: string;
  _type?: string;
  [index: string]: unknown;
}
export interface MessageEvent {
  data: StudioDocument & {
    _eventType?: string;
    [index: string]: unknown;
  };
}
