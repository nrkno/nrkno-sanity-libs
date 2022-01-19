import {
  createCustomGroup,
  createSubgroup,
  getSubgroupEntries,
  initRegistry,
} from './group-registry';
import { DocumentSchema } from '@nrk/nrkno-sanity-typesafe-schemas';
import {
  CustomItem,
  CustomStructureSpec,
  CustomSubgroup,
  DocumentList,
  SingletonDocument,
  SingletonSpec,
  Subgroup,
} from './types';

const emptySubgroup: Omit<Subgroup, 'spec'> = {
  groups: [],
  schemas: [],
  documents: [],
  customItems: [],
};

export const customGroups = {
  testGroup: createCustomGroup({
    urlId: 'testGroup',
    title: 'Test',
    icon: () => null,
    addToCreateMenu: true,
  }),
  otherGroup: createCustomGroup({
    title: 'Other',
    urlId: 'otherGroup',
    icon: () => null,
    addToCreateMenu: false,
  }),
  requiresAdmin: createCustomGroup({
    title: 'Admin',
    urlId: 'requiresAdmin',
    icon: () => null,
    addToCreateMenu: false,
    enabledForRoles: ['admin'],
  }),
} as const;

type CustomGroups = typeof customGroups;

declare module './group-registry' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface GroupRegistry extends CustomGroups {}
}

describe('group-registry', () => {
  test('should init registry with groups', async () => {
    const inTestGroup: DocumentSchema = createDoc({
      name: 'inTestGroup',
      customStructure: { type: 'document-list', group: 'testGroup' },
    });
    const ungrouped: DocumentSchema = createDoc({ name: 'ungrouped' });

    const registry = initRegistry({
      schemas: [inTestGroup, ungrouped],
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });

    const expectedTestGroup: DocumentList = {
      schema: inTestGroup,
      spec: {
        group: 'testGroup',
        title: 'inTestGroup',
        type: 'document-list',
        urlId: 'inTestGroup',
      },
    };

    expect(registry.groups.testGroup?.schemas).toEqual([expectedTestGroup]);
    expect(registry.ungroupedSchemas).toEqual([ungrouped]);
  });

  test('should put schema in manual list', async () => {
    const schema: DocumentSchema = createDoc({
      name: 'schema',
      customStructure: { type: 'manual' },
    });

    const registry = initRegistry({
      schemas: [schema],
      groups: [],
      getUser: () => undefined,
    });

    expect(registry.ungroupedSchemas).toHaveLength(0);
    expect(registry.manualSchemas).toEqual([schema]);
  });

  test('should add schemas to group', async () => {
    const schema1 = createDoc({
      name: 'schema1',
      customStructure: { type: 'document-list', group: 'testGroup' },
    });
    const schema2 = createDoc({
      name: 'schema2',
      customStructure: { type: 'document-list', group: 'testGroup' },
    });
    const schema3 = createDoc({
      name: 'exp',
      customStructure: { type: 'document-list', group: 'otherGroup' },
    });

    const registry = initRegistry({
      schemas: [schema1, schema2, schema3],
      groups: [customGroups.testGroup, customGroups.otherGroup],
      getUser: () => undefined,
    });

    expect(Object.keys(registry.groups).sort()).toEqual(['testGroup', 'otherGroup'].sort());
    expect(registry.groups.testGroup?.schemas.map((s) => s.schema)).toEqual([schema1, schema2]);
    expect(registry.groups.otherGroup?.schemas.length).toEqual(1);
  });

  test('should remove disabled schema', async () => {
    const schema: DocumentSchema = createDoc({
      name: 'animation1',
      type: 'document',
      fields: [],
      customStructure: {
        type: 'document-list',
      },
    });
    const registry = initRegistry({
      schemas: [schema],
      groups: [customGroups.testGroup],
      isSchemaDisabled: (s) => s.name === schema.name,
      getUser: () => undefined,
    });

    // empty groups are removed
    expect(registry.groups.testGroup).toBeUndefined();
  });

  test('should remove disabled group', async () => {
    const schema: DocumentSchema = createDoc({
      name: 'animation1',
      type: 'document',
      fields: [],
      customStructure: {
        type: 'document-list',
      },
    });
    const registry = initRegistry({
      schemas: [schema],
      groups: [customGroups.testGroup],
      isSubgroupDisabled: () => true,
      getUser: () => undefined,
    });

    // empty groups are removed
    expect(registry.groups.testGroup).toBeUndefined();
  });

  test('should remove schema when user is missing role for group', async () => {
    const schema: DocumentSchema = createDoc({
      name: 'animation1',
      type: 'document',
      fields: [],
      customStructure: {
        type: 'document-list',
        group: 'requiresAdmin',
      },
    });
    const registry = initRegistry({
      schemas: [schema],
      groups: [customGroups.requiresAdmin],
      getUser: () => ({
        id: 'userid',
        name: 'User',
        email: 'email',
        role: 'custom',
        roles: [{ title: 'Not admin', name: 'not-admin' }],
      }),
    });

    // empty groups are removed
    expect(registry.groups.requiresAdmin).toBeUndefined();
  });

  test('should remove schema when user is missing role for schema', async () => {
    const schema: DocumentSchema = createDoc({
      name: 'animation1',
      type: 'document',
      fields: [],
      customStructure: {
        type: 'manual',
        enabledForRoles: ['admin'],
      },
    });
    const registry = initRegistry({
      schemas: [schema],
      groups: [],
      getUser: () => ({
        id: 'userid',
        name: 'User',
        email: 'email',
        role: 'custom',
        roles: [{ title: 'Not admin', name: 'not-admin' }],
      }),
    });

    expect(registry.ungroupedSchemas).toHaveLength(0);
  });

  test('should put schema in subgroup', async () => {
    const spec: CustomStructureSpec = {
      type: 'document-list',
      group: 'testGroup',
      subgroup: { urlId: 'test', title: 'Test' },
    };
    const schema1: DocumentSchema = createDoc({ name: 'schema1', customStructure: spec });
    const schema2: DocumentSchema = createDoc({ name: 'schema2', customStructure: spec });

    const registry = initRegistry({
      schemas: [schema1, schema2],
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });
    const expected: Subgroup[] = [
      {
        ...emptySubgroup,
        spec: { type: 'subgroup', urlId: 'test', title: 'Test' },
        schemas: [
          { schema: schema1, spec: { ...spec, title: 'schema1', urlId: 'schema1' } },
          { schema: schema2, spec: { ...spec, title: 'schema2', urlId: 'schema2' } },
        ],
      },
    ];
    expect(registry.groups.testGroup?.groups).toEqual(expected);
  });

  test('should put schema in nested subgroups', async () => {
    const outerSubgroup: CustomSubgroup = { urlId: 'outer', title: 'Outer' };
    const innerSubgroup: CustomSubgroup = { urlId: 'inner', title: 'Inner' };
    const docList: CustomStructureSpec = {
      type: 'document-list',
      group: 'testGroup',
      subgroup: [outerSubgroup, innerSubgroup],
    };

    const doc: DocumentSchema = createDoc({ name: 'doc', customStructure: docList });

    const registry = initRegistry({
      schemas: [doc],
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });

    const expected: Subgroup[] = [
      {
        ...emptySubgroup,
        spec: { type: 'subgroup', urlId: 'outer', title: 'Outer' },
        groups: [
          {
            ...emptySubgroup,
            spec: { type: 'subgroup', urlId: 'inner', title: 'Inner' },
            schemas: [{ schema: doc, spec: { ...docList, title: 'doc', urlId: 'doc' } }],
          },
        ],
      },
    ];
    expect(registry.groups.testGroup?.groups).toEqual(expected);
  });

  test('should put singleton document in subgroup', async () => {
    const documents: SingletonSpec['documents'] = [
      { urlId: 'test-doc', documentId: 'test-doc', title: 'Test Doc', icon: () => null },
    ];
    const schema = createDoc({
      name: 'schema',
      customStructure: {
        type: 'document-singleton',
        group: 'testGroup',
        subgroup: { urlId: 'test', title: 'Test' },
        documents: documents,
      },
    });
    const registry = initRegistry({
      schemas: [schema],
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });
    const expected: Subgroup[] = [
      {
        ...emptySubgroup,
        spec: { type: 'subgroup', urlId: 'test', title: 'Test' },
        documents: documents.map((d) => ({
          spec: { ...d, urlId: d.urlId ?? '', title: d.title ?? '', type: 'document' },
          schema,
        })),
      },
    ];
    expect(registry.groups.testGroup?.groups).toEqual(expected);
  });

  test('should put custom builder in subgroup', async () => {
    const customBuilder = () => {
      throw new Error('not implemented');
    };
    const schema: DocumentSchema = createDoc({
      name: 'schema',
      customStructure: {
        type: 'custom-builder',
        group: 'testGroup',
        subgroup: { urlId: 'test', title: 'Test' },
        listItem: customBuilder,
      },
    });
    const registry = initRegistry({
      schemas: [schema],
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });
    const expectedCustomSpec: CustomStructureSpec & { title: string } = {
      group: 'testGroup',
      subgroup: { urlId: 'test', title: 'Test' },
      type: 'custom-builder',
      title: '',
      listItem: customBuilder,
    };

    const expected: Subgroup[] = [
      {
        ...emptySubgroup,
        spec: { type: 'subgroup', urlId: 'test', title: 'Test' },
        customItems: [{ spec: expectedCustomSpec, schema }],
      },
    ];
    expect(registry.groups.testGroup?.groups).toEqual(expected);
  });

  test('should put custom builder in ungrouped', async () => {
    const customBuilder = () => {
      throw new Error('not implemented');
    };
    const schema: DocumentSchema = createDoc({
      name: 'schema',
      customStructure: {
        type: 'custom-builder',
        listItem: customBuilder,
      },
    });
    const registry = initRegistry({
      schemas: [schema],
      groups: [],
      getUser: () => undefined,
    });

    expect(registry.ungroupedSchemas).toEqual([schema]);
  });

  test('should sort by sortKey ?? title lexically', () => {
    const schema: DocumentSchema = { type: 'document', name: 'schema', fields: [] };

    const customWithTitle = (title: string): CustomItem => ({
      schema,
      spec: {
        type: 'custom-builder',
        title: title,
        listItem: () => {
          throw new Error();
        },
      },
    });

    const docWithTitle = (title: string): SingletonDocument => ({
      schema,
      spec: {
        type: 'document',
        documentId: title,
        urlId: title,
        icon: () => null,
        title: title,
      },
    });

    const entries = getSubgroupEntries(
      {
        groups: [
          createSubgroup({ urlId: 'group1', title: 'group1' }),
          createSubgroup({ urlId: 'group2', title: 'group2' }),
          createSubgroup({ urlId: 'group3', title: 'group3 - sortKey å', sortKey: 'å' }),
        ],
        schemas: [
          { schema, spec: { group: 'testGroup', type: 'document-list', title: 'list1' } },
          { schema, spec: { group: 'otherGroup', type: 'document-list', title: 'list2' } },
          {
            schema,
            spec: {
              group: 'testGroup',
              type: 'document-list',
              title: 'list3 - sortKey abb',
              sortKey: 'abb',
            },
          },
        ],
        customItems: [
          customWithTitle('custom1'),
          customWithTitle('custom2'),
          {
            ...customWithTitle('custom3 - sortKey ab'),
            spec: {
              ...customWithTitle('custom3 - sortKey ab').spec,
              sortKey: 'ab',
            },
          },
        ],
        documents: [
          docWithTitle('doc1'),
          docWithTitle('doc2'),
          {
            ...docWithTitle('doc3 - sortKey a'),
            spec: {
              ...docWithTitle('doc3 - sortKey a').spec,
              sortKey: 'a',
            },
          },
        ],
        spec: { urlId: 'test', title: 'test', type: 'subgroup' },
      },
      'nb-NO'
    );
    expect(entries.map((e) => e.spec.title)).toEqual([
      'doc3 - sortKey a',
      'custom3 - sortKey ab',
      'list3 - sortKey abb',
      'custom1',
      'custom2',
      'doc1',
      'doc2',
      'group1',
      'group2',
      'list1',
      'list2',
      'group3 - sortKey å',
    ]);
  });

  test('should use no locale for sorting', () => {
    const sortA: DocumentSchema = createDoc({
      name: 'A',
      customStructure: { type: 'document-list', sortKey: 'A' },
    });
    const sortAb: DocumentSchema = createDoc({
      name: 'Ab',
      customStructure: { type: 'document-list', sortKey: 'Ab' },
    });
    const sortNorwegianAA: DocumentSchema = createDoc({
      name: 'norAA',
      customStructure: { type: 'document-list', sortKey: 'Å' },
    });

    const registry = initRegistry({
      schemas: [sortNorwegianAA, sortAb, sortA],
      groups: [],
      getUser: () => undefined,
      locale: 'no',
    });

    const names = registry.ungroupedSchemas.map((s) => s.name);
    const expectedNames = [sortA, sortAb, sortNorwegianAA].map((s) => s.name);
    expect(names).toEqual(expectedNames);
  });

  test('should use default locale for sorting', () => {
    const sortA: DocumentSchema = createDoc({
      name: 'A',
      customStructure: { type: 'document-list', sortKey: 'A' },
    });
    const sortAb: DocumentSchema = createDoc({
      name: 'Ab',
      customStructure: { type: 'document-list', sortKey: 'Ab' },
    });
    const sortNorwegianAA: DocumentSchema = createDoc({
      name: 'norAA',
      customStructure: { type: 'document-list', sortKey: 'Å' },
    });

    const registry = initRegistry({
      schemas: [sortNorwegianAA, sortAb, sortA],
      groups: [],
      getUser: () => undefined,
      // locale: 'en', //default
    });

    const names = registry.ungroupedSchemas.map((s) => s.name);
    const expectedNames = [sortA, sortNorwegianAA, sortAb].map((s) => s.name);
    expect(names).toEqual(expectedNames);
  });
});

export function createDoc(overrides: Partial<DocumentSchema> & { name: string }): DocumentSchema {
  return {
    type: 'document',
    fields: [],
    ...overrides,
  };
}
