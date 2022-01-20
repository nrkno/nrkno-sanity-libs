import { Preview, SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { Fieldset } from './util-types/fieldset';
import { ReactNode } from 'react';
import { InitialValueProperty } from '@sanity/types';
import { GenericField } from './generic';
import { FieldGroup } from './field-group';

/**
 * [Object docs](https://www.sanity.io/docs/object-type).
 */
export interface ObjectSchema extends SanitySchemaBase {
  type: 'object';
  options?: ObjectOptions;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: ObjectRule) => Validation<ObjectRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<Record<string, unknown>>;

  /**  [Preview docs](https://www.sanity.io/docs/previews-list-views) */
  preview?: Preview;

  /**  [Fieldsets docs](https://www.sanity.io/docs/object-type#AbjN0ykp). */
  fieldsets?: Fieldset[];

  /** [Customize block editor](https://www.sanity.io/docs/customization) */
  blockEditor?: {
    icon?: (props: unknown) => ReactNode;
  };

  fields: GenericField[];

  /** [Field Group docs]{@link https://www.sanity.io/docs/field-groups } */
  groups?: FieldGroup[];
}

/** [Object validation](https://www.sanity.io/docs/object-type#required()-418dc1fef733) */
// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObjectRule extends Rule<ObjectRule> {}

export interface ObjectOptions {
  /**
   * If set to true, the object will make the fields collapsible.
   *
   * By default, objects will be collapsible when reaching a depth/nesting level of 3.
   *
   * This can be overridden by setting collapsible: false
   */
  collapsible?: boolean;

  /**
   * Set to true to display fields as collapsed initially.
   * This requires the collapsible option to be set to true and
   * determines whether the fields should be collapsed to begin with.
   */
  collapsed?: boolean;

  /**
   * An integer corresponding to the number of columns in a grid for the inputs to flow between.
   */
  columns?: number;
}
