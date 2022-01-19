import { createDoc, customGroups } from './group-registry.test';
import { createFromTopMenu } from './structure-helpers';

describe('structure-helpers', () => {
  describe('createFromTopMenu', () => {
    it('create is true for schema without custom structure', () => {
      const canCreate = createFromTopMenu(createDoc({ name: 'schema' }), []);
      expect(canCreate).toBeTruthy();
    });

    it('create is false for schema with manual custom structure', () => {
      const canCreate = createFromTopMenu(
        createDoc({ name: 'schema', customStructure: { type: 'manual' } }),
        []
      );
      expect(canCreate).toBeFalsy();
    });

    it('create is true for schema with non-existent group', () => {
      const canCreate = createFromTopMenu(
        createDoc({ name: 'schema', customStructure: { type: 'manual' } }),
        []
      );
      expect(canCreate).toBeFalsy();
    });

    it('create is true for schema in group that has addToCreateMenu true', () => {
      const canCreate = createFromTopMenu(
        createDoc({
          name: 'schema',
          customStructure: { type: 'document-list', group: 'testGroup' },
        }),
        [customGroups.testGroup]
      );
      expect(canCreate).toBeTruthy();
    });

    it('create is false for schema in group that has addToCreateMenu false', () => {
      const canCreate = createFromTopMenu(
        createDoc({
          name: 'schema',
          customStructure: { type: 'document-list', group: 'otherGroup' },
        }),
        [customGroups.otherGroup]
      );
      expect(canCreate).toBeFalsy();
    });

    it('create is false for singleton documents', () => {
      const canCreate = createFromTopMenu(
        createDoc({
          name: 'schema',
          customStructure: { type: 'document-singleton', group: 'testGroup', documents: [] },
        }),
        [customGroups.testGroup]
      );
      expect(canCreate).toBeFalsy();
    });

    it('create is true for schema in group that has addToCreateMenu false, but with schema addToCreateMenu true', () => {
      const canCreate = createFromTopMenu(
        createDoc({
          name: 'schema',
          customStructure: { type: 'document-list', group: 'otherGroup', addToCreateMenu: true },
        }),
        [customGroups.otherGroup]
      );
      expect(canCreate).toBeTruthy();
    });
  });
});
