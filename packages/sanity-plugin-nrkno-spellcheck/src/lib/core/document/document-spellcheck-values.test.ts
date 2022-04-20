import { blockSpanSeparator, getSpellcheckedValues } from './document-spellcheck-values';
import {
  ArraySchemaType,
  Block,
  ObjectField,
  ObjectSchemaType,
  StringSchemaType,
} from '@sanity/types';
import { SanityDocument } from '@sanity/client';
import { typed } from '../helpers';
import { Language, OffsetPathValue } from '../types';

const someLanguage: Language = { code: 'someLang', title: 'Some language' };

describe('spellcheck-values', () => {
  it('it should not spellcheck string or text fields with list option (or fields with non-string values)', () => {
    const schema = docSchema([
      { name: 'textField', type: { name: 'text', jsonType: 'string', options: { list: [] } } },
      { name: 'stringField', type: { name: 'string', jsonType: 'string', options: { list: [] } } },
      { name: 'numberField', type: { name: 'number', jsonType: 'number' } },
    ]);
    const document = doc({
      textField: 'textFieldValue',
      stringField: 'stringFieldValue',
      numberField: 1,
    });

    const state = getSpellcheckedValues(document, schema, someLanguage);

    const expected: OffsetPathValue[][] = [];
    expect(state).toEqual(expected);
  });

  it('it should not spellcheck string or text fields with options.spellcheck: false', () => {
    const schema = docSchema([
      {
        name: 'textField',
        type: {
          name: 'text',
          jsonType: 'string',
          options: { spellcheck: false } as any,
        },
      },
      {
        name: 'stringField',
        type: {
          name: 'string',
          jsonType: 'string',
          options: { spellcheck: false } as any,
        },
      },
    ]);
    const document = doc({
      textField: 'textFieldValue',
      stringField: 'stringFieldValue',
    });

    const state = getSpellcheckedValues(document, schema, someLanguage);

    const expected: OffsetPathValue[][] = [];
    expect(state).toEqual(expected);
  });

  it('it should spellcheck standard string and text fields', () => {
    const schema = docSchema([
      { name: 'textField', type: { name: 'text', jsonType: 'string' } },
      { name: 'stringField', type: { name: 'string', jsonType: 'string' } },
    ]);
    const document = doc({ textField: 'textFieldValue', stringField: 'stringFieldValue' });

    const state = getSpellcheckedValues(document, schema, someLanguage);

    const expected: OffsetPathValue[][] = [
      [
        {
          path: ['textField'],
          offset: 0,
          spellcheck: true,
          type: { jsonType: 'string', name: 'text' },
          parentFieldTypes: [schema],
          value: 'textFieldValue',
          blockFieldPath: undefined,
          blockParentType: undefined,
          blockValue: undefined,
        },
      ],
      [
        {
          path: ['stringField'],
          offset: 0,
          spellcheck: true,
          type: { jsonType: 'string', name: 'string' },
          parentFieldTypes: [schema],
          value: 'stringFieldValue',
          blockFieldPath: undefined,
          blockParentType: undefined,
          blockValue: undefined,
        },
      ],
    ];
    expect(state).toEqual(expected);
  });

  it('it should skip string with anouther language', () => {
    const schema = docSchema([
      {
        name: 'someLangField',
        type: {
          name: 'string',
          jsonType: 'string',
          options: typed<any>({ spellcheck: someLanguage.code }),
        },
      },
      {
        name: 'otherLangField',
        type: {
          name: 'string',
          jsonType: 'string',
          options: typed<any>({ spellcheck: 'otherLang' }),
        },
      },
    ]);
    const document = doc({ someLangField: 'someLangValue', string2: 'otherLangField' });

    const state = getSpellcheckedValues(document, schema, someLanguage);

    const expected: OffsetPathValue[][] = [
      [
        {
          path: ['someLangField'],
          offset: 0,
          spellcheck: true,
          type: schema.fields[0].type,
          parentFieldTypes: [schema],
          value: 'someLangValue',
          blockFieldPath: undefined,
          blockParentType: undefined,
          blockValue: undefined,
        },
      ],
    ];
    expect(state).toEqual(expected);
  });

  it('it should spellcheck span.text (and group the text by block field)', () => {
    const blockArrayType: ArraySchemaType = {
      name: 'array',
      jsonType: 'array',
      of: [blockType],
    };
    const schema = docSchema([
      {
        name: 'blocksField',
        type: blockArrayType,
      },
    ]);
    const document = doc({
      blocksField: [
        typed<Block>({
          _type: 'block',
          _key: 'xyz',
          style: 'style',
          markDefs: [],
          children: [
            { _type: 'span', _key: 'span1', marks: [], text: 'span1Text' },
            { _type: 'span', _key: 'span2', marks: [], text: 'span2Text' },
          ],
        }),
      ],
    });

    const state = getSpellcheckedValues(document, schema, someLanguage);

    const expected: OffsetPathValue[][] = [
      [
        {
          path: ['blocksField', { _key: 'xyz' }, 'children', { _key: 'span1' }, 'text'],
          blockFieldPath: ['blocksField'],
          blockParentType: schema.fields[0].type,
          blockValue: document.blocksField[0],
          parentFieldTypes: [schema, blockArrayType, blockType, childrenType, spanType],
          offset: 0,
          spellcheck: true,
          type: {
            name: 'string',
            jsonType: 'string',
          },
          value: 'span1Text',
        },
        {
          path: ['blocksField', { _key: 'xyz' }, 'children', { _key: 'span2' }, 'text'],
          blockFieldPath: ['blocksField'],
          blockParentType: schema.fields[0].type,
          blockValue: document.blocksField[0],
          offset: document.blocksField[0].children[0].text.length + blockSpanSeparator.length,
          parentFieldTypes: [schema, blockArrayType, blockType, childrenType, spanType],
          spellcheck: true,
          type: {
            name: 'string',
            jsonType: 'string',
          },
          value: 'span2Text',
        },
      ],
    ];
    expect(state).toEqual(expected);
  });

  it('it should skip span.text when block language is different', () => {
    const schema = docSchema([
      {
        name: 'blocksField',
        type: {
          name: 'array',
          jsonType: 'array',
          of: [blockType],
          options: typed<any>({ spellcheck: 'otherLang' }),
        },
      },
    ]);
    const document = doc({
      blocksField: [
        typed<Block>({
          _type: 'block',
          _key: 'xyz',
          style: 'style',
          markDefs: [],
          children: [{ _type: 'span', _key: 'span1', marks: [], text: 'span1Text' }],
        }),
      ],
    });

    const state = getSpellcheckedValues(document, schema, someLanguage);
    const expected: OffsetPathValue[][] = [];
    expect(state).toEqual(expected);
  });

  it('it should skip slug fields', () => {
    const schema = docSchema([
      {
        name: 'slugField',
        type: {
          name: 'slug',
          jsonType: 'object',
          fields: [
            {
              name: 'current',
              type: {
                name: 'string',
                jsonType: 'string',
              },
            },
          ],
          __experimental_search: [],
        },
      },
    ]);
    const document = doc({
      slugField: {
        current: 'some-slug',
      },
    });

    const state = getSpellcheckedValues(document, schema, someLanguage);
    const expected: OffsetPathValue[][] = [];
    expect(state).toEqual(expected);
  });

  it('it should spellcheck string fields with option.spellcheck: true (and traverse objects)', () => {
    const stringType: StringSchemaType = {
      name: 'string',
      jsonType: 'string',
      options: typed<any>({ spellcheck: true }),
    };
    const objectType: ObjectSchemaType = {
      name: 'some-object',
      jsonType: 'object',
      fields: [
        {
          name: 'nestedSpellcheckedStringField',
          type: stringType,
        },
      ],
      __experimental_search: [],
    };
    const schema = docSchema([
      {
        name: 'objectField',
        type: objectType,
      },
    ]);
    const document = doc({
      objectField: { nestedSpellcheckedStringField: 'nestedSpellcheckedStringFieldValue' },
    });

    const state = getSpellcheckedValues(document, schema, someLanguage);

    const expected: OffsetPathValue[][] = [
      [
        {
          path: ['objectField', 'nestedSpellcheckedStringField'],
          offset: 0,
          spellcheck: true,
          parentFieldTypes: [schema, objectType],
          type: stringType,
          value: 'nestedSpellcheckedStringFieldValue',
          blockFieldPath: undefined,
        },
      ],
    ];
    expect(state).toEqual(expected);
  });

  it('it should not spellcheck hidden fields, or children of hidden fields', () => {
    const schema = docSchema([
      {
        name: 'hiddenTextField',
        type: typed<any>({ name: 'text', jsonType: 'string', hidden: true }),
      },
      {
        name: 'objectField',
        type: {
          name: 'some-object',
          jsonType: 'object',
          hidden: true,
          fields: [
            {
              name: 'nestedHiddenStringField',
              type: {
                name: 'string',
                jsonType: 'string',
              },
            },
          ],
        },
      },
    ]);
    const document = doc({
      hiddenTextField: 'hiddenTextFieldValue',
      objectField: { nestedHiddenStringField: 'noSpellcheck' },
    });

    const state = getSpellcheckedValues(document, schema, someLanguage);

    const expected: OffsetPathValue[][] = [];
    expect(state).toEqual(expected);
  });
});

function docSchema(fields: ObjectField[]): ObjectSchemaType {
  return {
    jsonType: 'object',
    name: 'some-doc',
    fields,
    __experimental_search: [],
  };
}

function doc<T>(fields: T): SanityDocument & T {
  return {
    _id: 'id',
    _type: 'some-type',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: '1',
    ...fields,
  };
}

const spanType = typed<ObjectSchemaType>({
  name: 'span',
  jsonType: 'object',
  fields: [{ name: 'text', type: { name: 'string', jsonType: 'string' } }],
  type: { name: 'span', jsonType: 'object', type: null } as any,
  __experimental_search: [],
});

const childrenType = typed<ArraySchemaType>({
  name: 'array',
  jsonType: 'array',
  of: [spanType],
  type: { name: 'array', jsonType: 'array', of: [], type: null } as any,
});

const blockType = typed<ObjectSchemaType>({
  name: 'block',
  jsonType: 'object',
  fields: [{ name: 'children', type: childrenType }],
  type: { name: 'block', jsonType: 'object', type: null } as any,
  __experimental_search: [],
});
