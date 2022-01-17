import { ReactNode } from 'react';
import { arrayOf, field, schema } from '../typesafe-schemas';

declare module '../schemas/document' {
  interface DocumentSchema {
    previewComponent?: ReactNode;
  }

  interface DocumentOptions {
    custom?: boolean;
  }
}

export const testDocumentSchema = schema('document', {
  name: 'test',
  title: 'Test document',
  fields: [
    field('string', {
      name: 'stringField',
      title: 'Text',
    }),
    field('array', {
      name: 'someArray',
      title: 'Some strings',
      of: [arrayOf('string', {})],
    }),
  ],
  // DocumentSchema above has been declaration merged with DocumentSchema in the lib
  // so this field is now autocompletable and allowed for all document schemas
  previewComponent: () => {
    return null;
  },
  options: {
    // DocumentSchema above has been declaration merged with DocumentSchema in the lib
    // so this field is now autocompletable and allowed for all document schemas
    custom: true,
  },
});
