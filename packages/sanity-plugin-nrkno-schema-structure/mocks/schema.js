const mockTypes = {
  groupedSchema: {
    type: 'document',
    name: 'groupedSchema',
    title: 'Grouped schema',
    fields: [],
    customStructure: {
      type: 'document-list',
      group: 'testGroup',
    },
  },
  ungroupedSchema: {
    type: 'document',
    name: 'ungroupedSchema',
    title: 'Ungrouped schema',
    fields: [],
  },
  manualSchema: {
    type: 'document',
    name: 'manualSchema',
    title: 'Manual schema',
    fields: [],
    customStructure: {
      type: 'manual',
    },
  },
};

module.exports = {
  name: 'test',
  get: (typeName) => mockTypes[typeName],
  getTypeNames: () => Object.keys(mockTypes),
};
