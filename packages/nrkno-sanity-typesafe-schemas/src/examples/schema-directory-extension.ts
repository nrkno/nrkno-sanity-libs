import { StringSchema } from '../schemas/string';
import { arrayOf, field, schema } from '../typesafe-schemas';

export type SpecialStringSchema = Omit<StringSchema, 'type'> & {
  type: 'special-string';
  options: {
    special: string;
  };
};

declare module '../schema-directory' {
  interface SchemaDirectory {
    'special-string': SpecialStringSchema;
  }
}

// 'special-string' schema has been added to the SchemaDirectory by the declaration merge above.
// The schema in the helper-function is now type-narrowed to SpecialStringSchema,
// and will ensure typesafety for that type.
field('special-string', {
  name: 'specialStringField',
  title: 'Special text',
  options: {
    special: 'wicked',
  },
});

schema('special-string', {
  name: 'schema-derived-from-special-string',
  title: 'Special text',
  options: {
    special: 'wicked',
  },
});

arrayOf('special-string', { options: { special: 'thing' } });
