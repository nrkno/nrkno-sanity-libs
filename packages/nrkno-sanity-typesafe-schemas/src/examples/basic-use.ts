import { field, schema, typed } from '../typesafe-schemas';
import { FieldGroup } from '../schemas/field-group';

/** 'Typed' Field Groups definition */
const groups = {
  group1: typed<FieldGroup>({ name: 'group1', title: 'Group 1' }),
  group2: typed<FieldGroup>({ name: 'group2', title: 'Group 2' }),
} as const;

export const typesafeObjectSchema = schema('object', {
  name: 'some-doc',
  title: 'Some document',
  groups: Object.values(groups),
  fields: [
    field('string', {
      name: 'someField',
      title: 'Some title',
      group: groups.group1.name,
      initialValue: 'a',
      options: {
        list: [
          { value: 'a', title: 'A' },
          { value: 'b', title: 'B' },
        ],
        layout: 'radio',
      },
    }),
    field('string', {
      name: 'multiGroupField',
      title: 'Field with multiple Field Groups',
      group: [groups.group1.name, groups.group2.name],
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
