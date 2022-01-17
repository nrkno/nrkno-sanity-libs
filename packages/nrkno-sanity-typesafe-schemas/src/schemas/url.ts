import { Rule, Validation } from './util-types/validation';
import { SanitySchemaBase } from './util-types/common';
import { InitialValueProperty } from '@sanity/types';

/**
 * [URL docs](https://www.sanity.io/docs/url-type)
 */
export interface UrlSchema extends SanitySchemaBase {
  type: 'url';

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: UrlRule) => Validation<UrlRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<string>;
  options?: UrlOptions;
}

// allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UrlOptions {}

/** [URL validation docs](https://www.sanity.io/docs/url-type#uri(options)-d6cd6abe25d1) */
export interface UrlRule extends Rule<UrlRule> {
  uri: (options: {
    /** scheme - String, RegExp or Array of schemes to allow (default: ['http', 'https']). */
    scheme?: string | RegExp | string[];
    allowRelative?: boolean;
    relativeOnly?: boolean;
  }) => UrlRule;
}
