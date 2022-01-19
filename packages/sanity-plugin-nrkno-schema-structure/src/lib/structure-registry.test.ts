import 'part:@sanity/base/schema';
import { initStructureRegistry } from './structure-registry';
import { customGroups } from './group-registry.test';
import { ListItemBuilder } from '@sanity/structure/lib/ListItem';

/*
 * See rootdir/mocks/schema.js for test-data being used
 */

describe('structure-registry', () => {
  test('should return empty list for group without entries', () => {
    const registry = initStructureRegistry({
      groups: [customGroups.otherGroup],
      getUser: () => undefined,
    });
    expect(registry.getGroup('otherGroup')).toEqual([]);
  });

  test('should return item for group with document', async () => {
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      getUser: () => undefined,
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
      getUser: () => undefined,
    });
    const group = registry.getGroup('testGroup');
    expect(group).toHaveLength(0);
  });

  test('should return documentlist in group', async () => {
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });
    const group = registry.getGroupItems('testGroup');
    expect(group).toHaveLength(1);

    const listItem = group[0] as ListItemBuilder;
    const serialized = listItem.serialize();
    expect(serialized.title).toEqual('Grouped schema');
    expect(serialized.id).toEqual('groupedSchema');
  });

  test('should return documentlist for manual schema', async () => {
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });
    const manualSchemas = registry.getManualSchemas();
    expect(manualSchemas).toEqual([
      {
        type: 'document',
        name: 'manualSchema',
        title: 'Manual schema',
        fields: [],
        customStructure: {
          type: 'manual',
        },
      },
    ]);
  });

  test('should return document-list for manual schema', async () => {
    const registry = initStructureRegistry({
      groups: [customGroups.testGroup],
      getUser: () => undefined,
    });
    const manualSchemas = registry.getManualSchemas();
    expect(manualSchemas).toEqual([
      {
        type: 'document',
        name: 'manualSchema',
        title: 'Manual schema',
        fields: [],
        customStructure: {
          type: 'manual',
        },
      },
    ]);
  });
});
