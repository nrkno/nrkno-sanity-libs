import { field, schema } from '../typesafe-schemas';

declare module '../schemas/array' {
  // additional options
  interface ArrayOptions {
    pageSize?: number;
  }

  // extend editModal options
  interface EditModal {
    inline: true;
  }
}

field('array', {
  name: 'someField',
  title: 'Array field',
  of: [{ type: 'someObjectType' }],
  options: {
    pageSize: 10,
    editModal: 'inline',
  },
});

schema('array', {
  name: 'someField',
  title: 'Array field',
  of: [{ type: 'someObjectType' }],
  options: {
    pageSize: 10,
    editModal: 'inline',
  },
});
