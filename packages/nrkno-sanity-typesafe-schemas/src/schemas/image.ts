import { SanitySchemaBase } from './util-types/common';
import { Rule, Validation } from './util-types/validation';
import { InitialValueProperty, AssetSource } from 'sanity';
import { GenericField } from './generic';

/** [Image docs](https://www.sanity.io/docs/image-type) */
export interface ImageSchema extends SanitySchemaBase {
  type: 'image';
  options?: ImageOptions;

  /**
   * An array of optional fields to add to the image record.
   * The fields added here follow the same pattern as fields defined on objects.
   *
   * This is useful for adding custom properties like caption, attribution, etc.
   * to the image record itself (see example in docs).
   *
   * In addition to the common field attributes,
   * each field may also have an isHighlighted option which dictates whether it
   * should be prominent in the edit UI or hidden in a dialog modal behind an edit
   * button (see example in docs).
   *
   * [Image fields docs](https://www.sanity.io/docs/image-type#fields-ab54e73207e5)
   */
  fields?: GenericField[];

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: ImageRule) => Validation<ImageRule>;

  /** [Initial value docs](https://www.sanity.io/docs/initial-value-templates) */
  initialValue?: InitialValueProperty<Record<string, unknown>>;
}

export interface ImageOptions {
  /** [Docs](https://www.sanity.io/docs/image-type#accept-785f76a21c7c)*/
  accept?: string;

  /** [Docs](https://www.sanity.io/docs/image-type#storeOriginalFilename-90bd9dce3f53) */
  storeOriginalFilename?: boolean;

  /**
   * Enables the user interface for selecting what areas of an image should always be
   * cropped, what areas should never be cropped and the center of the area to crop
   * around when resizing.
   *
   * The hotspot data is stored in the image field itself,
   * not in the image asset, so images can have different crop and center for each place
   * they are used.
   *
   * Hotspot makes it possible to responsively adapt the images to different aspec
   * t ratios at display time.
   *
   * The default is value for hotspot is false.
   *
   * [Docs](https://www.sanity.io/docs/image-type#hotspot-3e6da78954a8)
   */
  hotspot?: boolean;

  /**
   * This option defines what metadata the server attempts to extract from the image.
   * The extracted data is written into the image asset.
   *
   * This field must be an array of strings where accepted values are
   * exif, location, lqip, blurhash and palette.
   *
   * Read more about image metadata in [this reference document](https://www.sanity.io/docs/image-metadata).
   *
   * [Docs](https://www.sanity.io/docs/image-type#metadata-5fe564e516d8)
   */
  metadata?: ('exif' | 'location' | 'lqip' | 'palette' | 'blurhash')[];

  /** [Docs](https://www.sanity.io/docs/image-type#sources-d82cf03b063c) */
  sources?: AssetSource[];
}

// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ImageRule extends Rule<ImageRule> {}
