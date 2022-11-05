import { Options, SanitySchemaBase } from './util-types/common';
import { BooleanSchemaType, InitialValueProperty } from 'sanity';
import { Rule, Validation } from './util-types/validation';

/**
 * [Boolean docs]{@link https://www.sanity.io/docs/boolean-type }.
 */
export interface BooleanSchema extends SanitySchemaBase {
  type: 'boolean';
  options?: BooleanOptions;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: BooleanRule) => Validation<BooleanRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<boolean>;
}

// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BooleanRule extends Rule<BooleanRule> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BooleanOptions extends Partial<Options<BooleanSchemaType>> {}
