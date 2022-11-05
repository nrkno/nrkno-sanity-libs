import { Path, SchemaType } from 'sanity';
import { SanityDocument } from 'sanity';

export interface ValidationContext<ParentField = unknown, Document = SanityDocument> {
  parent?: ParentField;
  document?: Document;
  path?: Path;
  type?: SchemaType;
}

export interface Rule<T> {
  /** [Validation basics](https://www.sanity.io/docs/validation#4dc8b38bc411) */
  required: () => T;

  /** [Custom validation docs](https://www.sanity.io/docs/validation#091e10f957aa) */
  custom: <FieldValue, ParentFieldValue, Document>(
    fn: (
      field: FieldValue,
      context: ValidationContext<ParentFieldValue, Document>
    ) => boolean | string | ChildValidation | Promise<boolean | string | ChildValidation>
  ) => T;

  /** [Error message docs]{@link https://www.sanity.io/docs/validation#error-levels-and-error-messages-812ebcd2ff64} */
  error: (message?: string) => T;
  /** [Error message docs]{@link https://www.sanity.io/docs/validation#error-levels-and-error-messages-812ebcd2ff64} */
  warning: (message?: string) => T;

  /**
   * [Reference other fields]{@link https://www.sanity.io/docs/validation#referencing-other-fields-1d8eb8fbb695 }
   */
  valueOfField: <T = unknown>(fieldName: string) => T;
}

export interface ChildValidation {
  message: string;
  paths: Path[];
}

/**
 * Use array version if both {@link Rule#warning} & {@link Rule#error} is required.
 *
 * [Error message docs]{@link https://www.sanity.io/docs/validation#error-levels-and-error-messages-812ebcd2ff64}
 */
export type Validation<T extends Rule<T>> = T | T[];
