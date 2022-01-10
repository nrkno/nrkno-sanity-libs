import { Preview, SanitySchemaBase } from './schemas/util-types/common';
import { FieldBase } from './schemas/util-types/field';
import { SchemaDirectory, SchemaDirectoryType } from './schema-directory';
import { GenericField, GenericSchema } from './schemas/generic';

/** When type is "falsey", the type-field must be provided in schema/field/arrayOf schemas. */
type FallbackType = '' | undefined | null;

type SchemaOrFallback = SchemaDirectoryType | FallbackType;

type InferSchema<SchemaName extends SchemaOrFallback> = SchemaName extends SchemaDirectoryType
  ? SchemaDirectory[SchemaName]
  : GenericSchema;

type InferTypeField<SchemaType extends SchemaOrFallback> = SchemaType extends FallbackType
  ? { type: string }
  : { type?: Exclude<SchemaType, FallbackType> };

// Dont inline these. If these types are inlined, they will not work when Schema type definition starts with Omit

/**
 * Omits the following fields from Schema, they are re-added with improved typings by schema-function
 * * type: optional for types found in SchemaDirectory
 * * fields: the helper function narrows the type using generics
 */
type OmitForSchema<Schema extends SanitySchemaBase> = Omit<Schema, 'type' | 'fields'>;

/**
 * Omits the following fields from Schema, they are re-added with improved typings by the field-function
 * * type: optional for types found in SchemaDirectory
 */
type OmitForField<Schema extends SanitySchemaBase> = Omit<Schema, 'type'>;

/**
 * Omits the following fields from Schema, they are re-added with improved typings by the field-function
 * * type: optional for types found in SchemaDirectory
 * * name: is always optional in arrayOf context
 * * title: is always optional in arrayOf context
 */
type OmitForArrayOf<Schema extends SanitySchemaBase> = Omit<Schema, 'type' | 'name' | 'title'>;

/**
 * Used to define schemas that are consumed by `createSchema` in `part:@sanity/base/schema-creator`
 *
 * See docs for how to extend autocompletion beyond Sanity built-in types.
 *
 * For type-completion on fields, use {@link field}.
 * For type-completion in array.of, use {@link arrayOf}.
 *
 *  ## Usage
 * ```ts
 *
 * export const mySchema = schema('document', {
 *  name: 'my-schema',
 *  // intellisense for document-properties here
 *
 *  // it is recommended to use field method to defined fields, for better type-completion
 *  fields: [
 *     {
 *       name: 'field1',
 *       type: 'string',
 *       // only very limited typesafety
 *     },
 *     field('datetime', {
 *       name: 'field2',
 *       // intellisense for datetime-properties
 *     }),
 *     field( '' /* undefined and, 'custom' are also valid here *\/, {
 *       name: 'field3',
 *       // only rudimentary intellisense here; because 'some-schema-name' is a custom schema
 *       // if we need typesafe options use:
 *       options: typed<ISomeSchemaOptions>({
 *         // intellisense here
 *       })
 *     })
 *  ]
 * });
 *
 * ```
 *
 * @param type Sanity schema type name. Use a falsy value <code>'' | undefined | null</code> to refer to a user-made type by name.
 * @param schema Schema definition. Type field can be omitted, unless a falsy <code>type</code> is used.
 *
 * @see checkSchema
 * @see field
 * @see arrayOf
 * @see typed
 */
export function schema<
  SchemaName extends string,
  SchemaType extends SchemaOrFallback,
  Schema extends InferSchema<SchemaType>,
  SchemaField extends GenericField
>(
  type: SchemaType,
  schema: InferTypeField<SchemaType> &
    OmitForSchema<Schema> & {
      name: SchemaName;
      /** Omitting title results in console warnings during schema validation, so make it required. */
      title: string;
      /** Custom types may have fields, so having fields optional is a compromise */
      fields?: SchemaField[];
      preview?: Preview;
    }
) {
  return { type, ...schema };
}

/**
 * Used to define fields for `document`, `object`, `file` and `image` schemas.
 *
 * See docs for how to extend autocompletion beyond Sanity built-in types.
 *
 *  * Provides type-completion for built-in Sanity fields, used in document & object fields array.
 *
 * ## Usage
 * ```ts
 *
 * export const mySchema = schema('document', {
 *  name: 'my-schema',
 *  fields: [
 *     field('datetime', {
 *       name: 'field2',
 *       // intellisense for datetime-fields
 *     })
 *  ]
 * });
 *
 * ```
 *
 * @param type Sanity schema type name. Use a falsy value <code>'' | undefined | null</code> to refer to a user-made type by name.
 * @param schema Schema definition. Type field can be omitted, unless a falsy <code>type</code> is used.
 * @see schema
 * @see arrayOf
 * @see typed
 */
export function field<
  FieldName extends string,
  SchemaType extends SchemaOrFallback,
  Schema extends InferSchema<SchemaType>
>(
  type: SchemaType,
  schema: InferTypeField<SchemaType> &
    OmitForField<Schema> &
    FieldBase & {
      name: FieldName;
      /** Omitting title results in console warnings during schema validation, so make it required. */
      title: string;
      // options?: Schema extends { options?: unknown } ? Schema['options'] : never;
    }
) {
  return { type, ...schema };
}

/**
 * Used to define of-entries in `array` schemas.
 *
 * See docs for how to extend autocompletion beyond Sanity built-in types.
 *
 * ## Usage
 * ```ts
 *
 * export const mySchema = schema('document', {
 *  name: 'my-schema',
 *  fields: [
 *    field('array', {
 *      name: 'team',
 *      title: 'Team',
 *      of: [arrayOf('string', {  /* intellisense for arrayOf-fields here *\/ }) ],
 *   }),
 *  ]
 * });
 *
 * ```
 *
 * @param type Sanity schema type name. Use a falsy value <code>'' | undefined | null</code> to refer to a user-made type by name.
 * @param schema Optional array-of spec. Type field can be omitted, unless a falsy <code>type</code> is used.
 * @see schema
 * @see field
 * @see arrayOf
 *
 */
export function arrayOf<
  SchemaType extends SchemaOrFallback,
  Schema extends InferSchema<SchemaType>
>(
  type: SchemaType,
  schema?: InferTypeField<SchemaType> &
    OmitForArrayOf<Schema> & {
      title?: string;
      /** Must be used if multiple of-entries have the same type. It is appended to the type-name. */
      name?: string;
    }
) {
  return { type, ...schema };
}

/**
 * Ensures that only properties in `schemaInterface` (except _type & _key) are allowed as field-names
 * in object- or document-schemas. `schemaInterface` should be provided by [@link forType}.
 *
 * Also ensures that the `schemaInterface._type` is equal to `schema.name`.s
 *
 * This is simply a safeguard to keep `schemaInterface` and a `schema`-fields in sync; if new fields are added
 * to a document but not to the interface, compilation will fail.
 *
 * ## Usage
 * <pre><code>
 * const type = 'my-type' as const;
 *
 * interface IType {
 *   _type: typeof type;
 *   field1: string;
 *   field2: string;
 * }
 *
 * export const mySchema = schema('object', {
 *  name: type,
 *  fields: [
 *     {
 *       name: 'field1' as const,
 *       type: 'string'
 *     },
 *     field('datetime', {
 *       name: 'field2', // no need for as const, is narrowed to const by field
 *       // intellisense for datetime-properties
 *     }),
 *  ]
 * });
 *
 * checkSchema(forType<IType>, mySchema); // complier error here if fields.name is not in IType.
 * </code></pre>
 *
 * ## Beware
 *
 * * Field-names must be narrowed to `const`; they cannot be plain string. Either use `as const` or use
 * {@link field} for all fields in the schema (see Usage example).
 * * Does _not_ check correct type of fields.
 * * Missing fields will _not_ result in error.
 * * Duplicated fields will be reported runtime by Sanity.
 * * This method should be used after the schema is declared (see usage example).
 * (because of reasons pertaining to typescript object-literal type-inference intricacies not fully understood  by
 *  the author)
 *
 * </code></pre>
 * @see forType
 * @see schema
 * @see customSchema
 */
export function checkSchema<
  TypeName extends string,
  SchemaInterface extends { _type: TypeName },
  FieldName extends keyof Omit<SchemaInterface, '_type' | '_key'>,
  SchemaField extends { name: FieldName },
  Schema extends { name: SchemaInterface['_type']; fields?: SchemaField[] }
>(schemaInterface: SchemaInterface, schema: Schema) {
  return schema;
}

/**
 * @see checkSchema for intended usage
 */
export function forType<SchemaInterface>() {
  return {} as SchemaInterface;
}

/**
 * Passthrough function to provide inline types in json objects.
 *
 * @example
 * typed<MyType>({ must be MyType or error })
 *
 * @param arg
 */
export function typed<T>(arg: T) {
  return arg;
}
