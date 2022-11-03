import { initStructureRegistry } from './structure-registry';
import { customGroups } from './group-registry.test';
import { createStructureBuilder, ListItemBuilder, StructureBuilder } from 'sanity/desk';
import { getMockSource } from './test/test-utils';
import { StructureResolverContext } from 'sanity/lib/exports/desk';
import { defineType, DocumentStore, SanityClient } from 'sanity';

async function createResolverContext() {
  const source = await getMockSource({
    config: {
      schema: {
        types: [
          defineType({
            type: 'document' as const,
            name: 'groupedSchema',
            title: 'Grouped schema',
            fields: [{ type: 'string', name: 'title' }],
            customStructure: {
              type: 'document-list',
              group: 'testGroup',
            },
          }),
          defineType({
            type: 'document' as const,
            name: 'ungroupedSchema',
            title: 'Ungrouped schema',
            fields: [{ type: 'string', name: 'title' }],
          }),
          defineType({
            type: 'document' as const,
            name: 'manualSchema',
            title: 'Manual schema',
            fields: [{ type: 'string', name: 'title' }],
            customStructure: {
              type: 'manual',
            },
          }),
        ],
      },
    },
  });
  const S: StructureBuilder = createStructureBuilder({ source });
  const context: StructureResolverContext = {
    ...source,
    documentStore: undefined as unknown as DocumentStore, // unused
    client: undefined as unknown as SanityClient, // unused
  };

  return { S, context };
}

describe('structure-registry', () => {
  test('should return empty list for group without entries', async () => {
    const registry = initStructureRegistry({
      groups: [customGroups.otherGroup],
      ...(await createResolverContext()),
    });
    expect(registry.getGroup('otherGroup')).toEqual([]);
  });

  test('should return item for group with document', async () => {
    const context = await createResolverContext();
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      ...context,
    });
    const group = registry.getGroup('testGroup');
    expect(group).toHaveLength(1);

    const listItem = group[0] as ListItemBuilder;
    const serialized = listItem.serialize();
    expect(serialized.title).toEqual(customGroups.testGroup.title);
    expect(serialized.id).toEqual(customGroups.testGroup.urlId);
  });

  test('should return empty list for group where all documents are disabled', async () => {
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      isSchemaDisabled: () => true,
      ...(await createResolverContext()),
    });
    const group = registry.getGroup('testGroup');
    expect(group).toHaveLength(0);
  });

  test('should return documentlist in group', async () => {
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      ...(await createResolverContext()),
    });
    const group = registry.getGroupItems('testGroup');
    expect(group).toHaveLength(1);

    const listItem = group[0] as ListItemBuilder;
    const serialized = listItem.serialize();
    expect(serialized.title).toEqual('Grouped schema');
    expect(serialized.id).toEqual('groupedSchema');
  });

  test('should return documentlist for manual schema', async () => {
    const resolve = await createResolverContext();
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      ...resolve,
    });
    const manualSchemas = registry.getManualSchemas();
    expect(manualSchemas).toEqual([resolve.context.schema.get('manualSchema')]);
  });

  test('should return document-list for manual schema', async () => {
    const resolve = await createResolverContext();
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      ...resolve,
    });
    const manualSchemas = registry.getManualSchemas();
    expect(manualSchemas).toEqual([resolve.context.schema.get('manualSchema')]);
  });
});
