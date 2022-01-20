import { HideFunction } from './common';

export interface FieldBase {
  fieldset?: string;

  /** https://www.sanity.io/docs/schema-types#hidden-57ac9e4a350a and https://www.sanity.io/docs/conditional-fields*/
  hidden?: boolean | HideFunction;

  /** https://www.sanity.io/docs/schema-types#readOnly-da6ffd43feed */
  readOnly?: boolean;

  /** https://www.sanity.io/docs/field-groups */
  group?: string | string[];
}
