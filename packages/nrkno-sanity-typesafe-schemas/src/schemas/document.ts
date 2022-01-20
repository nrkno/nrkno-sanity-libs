import { Preview, SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty } from '@sanity/types';
import { Fieldset } from './util-types/fieldset';
import { GenericField } from './generic';
import { FieldGroup } from './field-group';

export interface DocumentOrdering {
  title: string;
  name: string;
  by: { field: string; direction: 'asc' | 'desc' }[];
}
/**
 * [Document type]{@link https://www.sanity.io/docs/document-type }.
 */
export interface DocumentSchema extends SanitySchemaBase {
  type: 'document';

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: DocumentRule) => Validation<DocumentRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty;

  /** [Preview docs](https://www.sanity.io/docs/previews-list-views) */
  preview?: Preview;

  /**  [Fieldsets docs](https://www.sanity.io/docs/object-type#AbjN0ykp). */
  fieldsets?: Fieldset[];

  /** [Sort order docs]{@ link https://www.sanity.io/docs/sort-orders } */
  orderings?: DocumentOrdering[];

  /** [Docs](https://www.sanity.io/docs/document-type#liveEdit-6752c1c910a8) */
  liveEdit?: boolean;

  fields: GenericField[];

  options?: DocumentOptions;

  /** [Field Group docs]{@link https://www.sanity.io/docs/field-groups } */
  groups?: FieldGroup[];
}

// allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DocumentOptions {}

/**
 * [Document validation]{@link https://www.sanity.io/docs/validation#document-level-validation-053289e55848 }.
 */
// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DocumentRule extends Rule<DocumentRule> {}
