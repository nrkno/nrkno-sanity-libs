import { ArraySchemaType, InitialValueProperty } from '@sanity/types';
import { PartialBy, SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';

type SanityArrayOpts<T = unknown> = Required<ArraySchemaType<T>>['options'];

interface ArraySchemaBase extends SanitySchemaBase {
  type: 'array';

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: ArrayRule) => Validation<ArrayRule>;
}

type SchemaOptionalName = PartialBy<SanitySchemaBase, 'name'> & {
  options?: unknown;
};

export interface ObjectArraySchema extends ArraySchemaBase {
  of: Readonly<SchemaOptionalName[]>;
  options?: ArrayOptions;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<unknown[]>;
}

export interface StringArraySchema extends ArraySchemaBase {
  of: Readonly<{ type: 'string' }[]>;
  options?: ArrayOptions<string>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<string[]>;
}

export type ArraySchema = StringArraySchema | ObjectArraySchema;

/**
 * Keys in this type are used as value for editModal (values does not matter).
 * Must be an interface to allow extending using declation merging.
 * */
export interface EditModal {
  dialog: true;
  fullscreen: true;
  popover: true;
  fold: true;
}

export interface ArrayOptions<T = unknown> extends Omit<SanityArrayOpts<T>, 'editModal'> {
  /**
   * Controls how the modal (for array content editing) is rendered.
   * [Edit modal docs](https://www.sanity.io/docs/array-type#editModal-c9e86d1fa27d)
   *
   * Beware: this field is marked as deprecated in @sanity/types
   * */
  editModal?: keyof EditModal;
}

/** [Array validation docs]{@link https://www.sanity.io/docs/array-type#required()-6f3cd038981b }*/
export interface ArrayRule extends Rule<ArrayRule> {
  min: (length: number) => ArrayRule;
  max: (length: number) => ArrayRule;
  length: (length: number) => ArrayRule;
  unique: () => ArrayRule;
}
