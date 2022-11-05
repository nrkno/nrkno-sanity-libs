import { SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty, AssetSource } from 'sanity';
import { GenericField } from './generic';

/**
 * [File docs]{@link https://www.sanity.io/docs/file-type }
 */
export interface FileSchema extends SanitySchemaBase {
  type: 'file';
  options?: FileOptions;

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: FileRule) => Validation<FileRule>;

  /**
   * An array of optional fields to add to the file field.
   * The fields added here follow the same pattern as fields defined on objects.
   * This is useful for allowing users to add custom metadata related to the usage of
   * this file (see example in docs).
   *
   * [File fields docs](https://www.sanity.io/docs/file-type#fields-93a1b58234d2)
   */
  fields?: GenericField[];

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<Record<string, unknown>>;
}

/** [File option docs]{@link https://www.sanity.io/docs/file-type#storeOriginalFilename-5d6374ef3caa}. */
export interface FileOptions {
  /**
   * This specifies which mime types the file input can accept.
   * Just like the accept attribute on native DOM file inputs and we can specify any valid file
   * type specifier:
   *
   * [Mozilla file specifier docs.]{@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers}
   *
   * [File option docs]{@link https://www.sanity.io/docs/file-type#storeOriginalFilename-5d6374ef3caa}.
   */

  accept?: string;

  /**
   * This will store the original filename in the asset document.
   * Please be aware that the name of uploaded files could reveal potentially sensitive
   * information (e.g. top_secret_planned_featureX.pdf). Default is true.
   *
   * [File option docs]{@link https://www.sanity.io/docs/file-type#storeOriginalFilename-5d6374ef3caa}.
   */
  storeOriginalFilename?: boolean;

  /**
   * Lock the asset sources available to this type to a specific subset.
   * Import the plugins by their part name, and use the import variable name as array entries.
   * The built in default asset source has the part name part:@sanity/form-builder/input/file/asset-source-default
   *
   * [Read more about custom asset sources]{@link https://www.sanity.io/docs/custom-asset-sources}.
   */
  sources?: AssetSource[];
}

/** [File validation docs]{@link https://www.sanity.io/docs/file-type#required()-07b91b168e6e} */
// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FileRule extends Rule<FileRule> {}
