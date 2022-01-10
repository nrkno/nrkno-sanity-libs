import { EnumListProps, SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty } from '@sanity/types';

/**
 * [Text docs](https://www.sanity.io/docs/text-type)
 *
 */
export interface TextSchema extends SanitySchemaBase {
  type: 'text';
  options?: TextOptions;

  /**
   * Controls the number of rows/lines in the rendered textarea. Default number of rows: 10.
   */
  rows?: number;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: TextRule) => Validation<TextRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<string>;
}

// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextOptions extends EnumListProps<string> {}

/** [String validation docs]{@link https://www.sanity.io/docs/string-type#required()-f5fd99d2b4c6} */
export interface TextRule extends Rule<TextRule> {
  /** [String validation docs]{@link https://www.sanity.io/docs/string-type#required()-f5fd99d2b4c6} */
  min: (length: number) => TextRule;
  /** [String validation docs]{@link https://www.sanity.io/docs/string-type#required()-f5fd99d2b4c6} */
  max: (length: number) => TextRule;
  /** [String validation docs]{@link https://www.sanity.io/docs/string-type#required()-f5fd99d2b4c6} */
  length: (length: number) => TextRule;
  /** [String validation docs]{@link https://www.sanity.io/docs/string-type#required()-f5fd99d2b4c6} */
  uppercase: () => TextRule;
  /** [String validation docs]{@link https://www.sanity.io/docs/string-type#required()-f5fd99d2b4c6} */
  lowercase: () => TextRule;
  /** [String validation docs]{@link https://www.sanity.io/docs/string-type#required()-f5fd99d2b4c6} */
  regex: (
    pattern: string | RegExp,
    options?: {
      /**
       * Providing a name will make the message more understandable to the user '
       * ("Does not match the <name>-pattern").
       */
      name?: string;
      invert?: boolean;
    }
  ) => TextRule;
}
