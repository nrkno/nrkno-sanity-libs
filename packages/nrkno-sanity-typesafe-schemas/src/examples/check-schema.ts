import { arrayOf, checkSchema, field, forType, schema } from '../typesafe-schemas';

interface SanityDocumentBase {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

// as const changes type from string to 'test'
const testDocType = 'test' as const;

/*  stored json model for the schema */
interface TestDocument extends SanityDocumentBase {
  _type: typeof testDocType;
  special?: string;
  someArray?: string[];
}

export const testDocumentSchema = schema('document', {
  name: 'test',
  title: 'Test document',
  fields: [
    field('special-string', {
      name: 'special',
      title: 'Special text',
      options: {
        special: 'wicked',
      },
    }),
    field('array', {
      name: 'someArray',
      title: 'Some strings',
      of: [arrayOf('string', {})],
    }),
  ],
  options: {
    custom: true,
  },
});

const schemaWithMoreFields = schema('document', {
  ...testDocumentSchema,
  fields: [
    ...(testDocumentSchema.fields || []),
    field('string', {
      name: 'anotherString',
      title: 'Another string ',
    }),
  ],
});

// Compiles since TestDocument keys are same as fields in testDocumentSchema
checkSchema(forType<TestDocument>(), testDocumentSchema);

// Typical developer slipup: a field was added to the schema, but not added to the type
// @ts-expect-error schemaWithMoreFields has fields with names not found in TestDocument
checkSchema(forType<TestDocument>(), schemaWithMoreFields);

interface WithAdditionalField extends TestDocument {
  otherField: string;
}

//this will not guard against fields in the interface missing in the schema unfortunately
checkSchema(forType<WithAdditionalField>(), testDocumentSchema);
