import { arrayOf, field, schema } from '../typesafe-schemas';

export const customStringType = schema('string', {
  name: 'string-list',
  title: 'String list',
  options: {
    list: [
      { title: 'Title A', value: 'a' },
      { title: 'Title B', value: 'b' },
    ],
  },
});

export const schemaReusingNamedType = schema('document', {
  name: 'test',
  title: 'Test document',
  fields: [
    field('', {
      // must provide type explicitly here, when type is "" in the helper
      type: customStringType.name,
      name: 'customString2',
      title: customStringType.title,
    }),
    field(undefined, {
      // must provide type explicitly here, when type is undefined in the helper
      type: customStringType.name,
      name: 'customString3',
      title: customStringType.title,
    }),
    field(null, {
      // must provide type explicitly here, when type is null in the helper
      type: customStringType.name,
      name: 'customString4',
      title: customStringType.title,
    }),
    field('array', {
      name: 'arrayWithCustom',
      title: 'Array with custom',
      of: [
        arrayOf('', {
          type: customStringType.name,
          initialValue: () => 'lol',
        }),
        arrayOf('', {
          type: customStringType.name,
          name: customStringType.name + '-modded',
          title: 'Modded',
          description: 'Some description',
        }),
      ],
    }),
  ],
});

schema('', {
  type: customStringType.name,
  name: 'what',
  title: 'What',
  initialValue: 'customStringInit',
  options: {},
});

field('', {
  type: customStringType.name,
  name: 'who',
  title: 'Who',
  options: {},
  inputComponent: () => {
    return null;
  },
  initialValue: () => Promise.resolve('customStringInit'),
});

arrayOf('', {
  type: customStringType.name,
  initialValue: () => 'customStringInit',
  options: {},
});
