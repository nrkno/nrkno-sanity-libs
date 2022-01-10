/* Public API for the library */
export { schema, field, arrayOf, typed, checkSchema, forType } from './typesafe-schemas';

/* key:schema list. Can be extended using declaration merging to provide additional autocomplete options. */
export { SchemaDirectory } from './schema-directory';

/* Fallback schema definition when using falsy type */
export { GenericSchema, GenericField } from './schemas/generic';

/* Definitions for Sanity built in types.
 * Schemas and Options can be extended using declaration merging.
 * Rules are provided so they can be used to compose reusable, typesafe functions. */
export {
  ObjectArraySchema,
  StringArraySchema,
  ArrayRule,
  ArrayOptions,
  EditModal,
} from './schemas/array';
export {
  BlockSchema,
  BlockRule,
  BlockList,
  BlockStyle,
  Marks,
  Decorator,
  Annotations,
} from './schemas/block';
export { BooleanSchema, BooleanOptions, BooleanRule } from './schemas/boolean';
export { DateSchema, DateOptions, DateRule } from './schemas/date';
export { DatetimeSchema, DatetimeOptions, DatetimeRule } from './schemas/datetime';
export { DocumentSchema, DocumentRule, DocumentOrdering } from './schemas/document';
export { FileSchema, FileOptions, FileRule } from './schemas/file';
export { GeopointSchema, GeopointRule } from './schemas/geopoint';
export { ImageSchema, ImageOptions, ImageRule } from './schemas/image';
export { NumberSchema, NumberOptions, NumberRule } from './schemas/number';
export { ObjectSchema, ObjectOptions, ObjectRule } from './schemas/object';
export {
  ReferenceSchema,
  ReferenceResolverOption,
  ReferenceStringOption,
  ReferenceRule,
} from './schemas/reference';
export {
  SlugSchema,
  SlugOptions,
  SlugRule,
  SlugSourceOptions,
  SlugUniqueOptions,
  SlugSourceFn,
  SlugifierFn,
  UniqueCheckerFn,
} from './schemas/slug';
export { StringSchema, StringOptions, StringRule } from './schemas/string';
export { TextSchema, TextOptions, TextRule } from './schemas/text';
export { UrlSchema, UrlRule } from './schemas/url';

/* Support types exported to allow for advanced customization via declaration merging */
export {
  SanitySchemaBase,
  EnumListProps,
  HideFunction,
  HideContext,
  Preview,
} from './schemas/util-types/common';
export { FieldBase } from './schemas/util-types/field';
export { Fieldset } from './schemas/util-types/fieldset';
export {
  Rule,
  Validation,
  ValidationContext,
  ChildValidation,
} from './schemas/util-types/validation';
