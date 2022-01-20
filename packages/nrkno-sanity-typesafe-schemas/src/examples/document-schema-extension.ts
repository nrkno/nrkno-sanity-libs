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
  groups: [
    {
      name: 'group1',
      title: 'Group 1',
    },
    {
      name: 'group2',
      title: 'Group 2',
    },
  ],
  fields: [
    field('string', {
      name: 'stringField',
      title: 'Text',
      group: 'group1',
    }),
    field('array', {
      name: 'someArray',
      title: 'Some strings',
      of: [arrayOf('string', {})],
      group: ['group1', 'group2'],
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
