import { EnumListProps, SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty } from '@sanity/types';

/**
 * [String docs]{@link https://www.sanity.io/docs/text-type}
 */
export interface StringSchema extends SanitySchemaBase {
  type: 'string';
  options?: StringOptions;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: StringRule) => Validation<StringRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<string>;
}

// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StringOptions extends EnumListProps<string> {}

/** [Text validation docs]{@link https://www.sanity.io/docs/text-type#required()-35a8cd8fa2cd} */
export interface StringRule extends Rule<StringRule> {
  /** [Text validation docs]{@link https://www.sanity.io/docs/text-type#required()-35a8cd8fa2cd} */
  min: (length: number) => StringRule;
  /** [Text validation docs]{@link https://www.sanity.io/docs/text-type#required()-35a8cd8fa2cd} */
  max: (length: number) => StringRule;
  /** [Text validation docs]{@link https://www.sanity.io/docs/text-type#required()-35a8cd8fa2cd} */
  length: (length: number) => StringRule;
  /** [Text validation docs]{@link https://www.sanity.io/docs/text-type#required()-35a8cd8fa2cd} */
  uppercase: () => StringRule;
  /** [Text validation docs]{@link https://www.sanity.io/docs/text-type#required()-35a8cd8fa2cd} */
  lowercase: () => StringRule;
  /** [Text validation docs]{https://www.sanity.io/docs/text-type#regex(pattern[,%20options])-22cedae7b25f} */
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
  ) => StringRule;
}
