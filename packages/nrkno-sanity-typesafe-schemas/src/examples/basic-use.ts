import { field, schema } from '../typesafe-schemas';

export const typesafeObjectSchema = schema('object', {
  name: 'some-doc',
  title: 'Some document',
  fields: [
    field('string', {
      name: 'someField',
      title: 'Some title',
      initialValue: 'a',
      options: {
        list: [
          { value: 'a', title: 'A' },
          { value: 'b', title: 'B' },
        ],
        layout: 'radio',
      },
    }),
    // using field helpers is optional, but recommended as the typing is limited in this case
    // it does allow a slow introduction of the typesafe helpers though, for instance by
    // using only schema for documents at first
    {
      type: 'anyType',
      name: 'noFieldHelperForU',
      options: {
        // in this case options is unknown, so anything goes
        whateverYouWant: true,
      },
    },
  ],
});
