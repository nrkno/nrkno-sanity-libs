import { Preview, SanitySchemaBase } from './util-types/common';
import { ReactNode } from 'react';
import { FieldBase } from './util-types/field';

/**
 * This is a "fallback" type.
 * Must be used when referring to an existing type in the codebase (derived from sanity types)
 * not listed in {@link SchemaDirectory}.
 */
export interface GenericSchema extends SanitySchemaBase {
  options?: unknown;
  validation?: (Rule: unknown) => unknown;
  preview?: Preview;
  /**
   * In the creation of a field in a document, we can specify an initialValue for that specific instance of the field.
   *
   * {@link https://www.sanity.io/docs/initial-value-templates#f21ca49a29ae Initial value templates docs }
   */
  initialValue?: unknown;

  inputComponent?: ReactNode;
  diffComponent?: ReactNode;

  /**
   * "Fallback" schemas can be derived from schemas with fields. Having this here is a compromise.
   */
  fields?: GenericField[];
}

/**
 * This is a "fallback" type for fields, when field helper method is not used.
 * Is also the base used when referring to an existing type in the codebase (derived from sanity types)
 * not listed in {@link SchemaDirectory}.
 */
export interface GenericField extends GenericSchema, FieldBase {}
