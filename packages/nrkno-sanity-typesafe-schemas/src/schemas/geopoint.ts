import { Rule, Validation } from './util-types/validation';
import { SanitySchemaBase } from './util-types/common';
import { InitialValueProperty } from '@sanity/types';

/**
 * [Geopoint docs](https://www.sanity.io/docs/geopoint-type):
 */
export interface GeopointSchema extends SanitySchemaBase {
  type: 'geopoint';

  /** [Validation docs](https://www.sanity.io/docs/validation) */
  validation?: (rule: GeopointRule) => Validation<GeopointRule>;

  initialValue?: InitialValueProperty<{
    _type: 'geopoint';
    lat: number;
    lng: number;
    alt: number;
  }>;
}

// must be interface and not type to allow for declaration merging
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GeopointRule extends Rule<GeopointRule> {}
