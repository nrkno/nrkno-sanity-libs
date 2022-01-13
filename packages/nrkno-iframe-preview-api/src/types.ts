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
