import { createPathPatch, createPathPatches } from './document-patch';
import { Path, StringSchemaType } from 'sanity';
import { ReplaceOperation } from '../types';

const stringType: StringSchemaType = { name: 'string', jsonType: 'string' };

describe('spellcheck-patch', () => {
  describe('createPatch', () => {
    it('it should replace all original with replacement', () => {
      const originalText = 'original original b original';
      const path: Path = ['field'];
      const type: StringSchemaType = { name: 'string', jsonType: 'string' };

      const baserReplaceOp = {
        textToReplace: 'original',
        replacement: 'replacement',
        pathValue: { value: originalText, path, type, spellcheck: true, parentFieldTypes: [] },
      };

      const ops: ReplaceOperation[] = [
        { ...baserReplaceOp, startPos: 0 },
        { ...baserReplaceOp, startPos: 9 },
        { ...baserReplaceOp, startPos: 20 },
      ];

      const pathPatch = createPathPatch(originalText, path, ops);

      expect(pathPatch).toEqual({ set: { field: 'replacement replacement b replacement' } });
    });

    it('it should create patch per path', () => {
      const patches = createPathPatches([
        {
          textToReplace: 'a',
          replacement: 'b',
          pathValue: {
            value: 'a',
            path: ['field1'],
            type: stringType,
            spellcheck: true,
            parentFieldTypes: [],
          },
          startPos: 0,
        },
        {
          textToReplace: 'c',
          replacement: 'd',
          pathValue: {
            value: 'c',
            path: ['field2'],
            type: stringType,
            spellcheck: true,
            parentFieldTypes: [],
          },
          startPos: 0,
        },
      ]);

      expect(patches).toEqual([{ set: { field1: 'b' } }, { set: { field2: 'd' } }]);
    });

    it('should support replacements of different length than the replaced word', () => {
      const stringType: StringSchemaType = { jsonType: 'string', name: 'string' };
      const pathValue = {
        type: stringType,
        path: ['title'],
        value: 'one two two two',
        spellcheck: true,
        parentFieldTypes: [],
      };
      const patches = createPathPatches([
        {
          pathValue: pathValue,
          textToReplace: 'one',
          replacement: '1',
          startPos: 0,
        },
        { pathValue: pathValue, textToReplace: 'two', replacement: '2', startPos: 8 },
      ]);

      expect(patches).toEqual([
        {
          set: {
            title: '1 two 2 two',
          },
        },
      ]);
    });
  });
});
