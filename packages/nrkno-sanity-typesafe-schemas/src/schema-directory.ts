import { DocumentSchema } from './schemas/document';
import { StringSchema } from './schemas/string';
import { ArraySchema } from './schemas/array';
import { BlockSchema } from './schemas/block';
import { BooleanSchema } from './schemas/boolean';
import { DateSchema } from './schemas/date';
import { DatetimeSchema } from './schemas/datetime';
import { FileSchema } from './schemas/file';
import { GeopointSchema } from './schemas/geopoint';
import { ImageSchema } from './schemas/image';
import { NumberSchema } from './schemas/number';
import { ObjectSchema } from './schemas/object';
import { ReferenceSchema } from './schemas/reference';
import { SlugSchema } from './schemas/slug';
import { TextSchema } from './schemas/text';
import { UrlSchema } from './schemas/url';

/**
 * Open for extension via declaration merging.
 * Adding entries to this interface will make them available for autocompletion in typesafe-schema helper functions.
 *
 * Keys in this interface is the autocompletable type in schema(type, schema), field(type, schema) and arrayOf(type, schema)
 * */
export interface SchemaDirectory {
  array: ArraySchema;
  block: BlockSchema;
  boolean: BooleanSchema;
  date: DateSchema;
  datetime: DatetimeSchema;
  document: DocumentSchema;
  file: FileSchema;
  geopoint: GeopointSchema;
  image: ImageSchema;
  number: NumberSchema;
  object: ObjectSchema;
  reference: ReferenceSchema;
  slug: SlugSchema;
  string: StringSchema;
  text: TextSchema;
  url: UrlSchema;
}

export type SchemaDirectoryType = SchemaDirectory[keyof SchemaDirectory]['type'];
