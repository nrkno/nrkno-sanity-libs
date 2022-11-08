import { getMisspelledWords } from './misspelled-words';
import { CachedSpellchecker } from './cached-spellchecker';
import { MisspelledWords, OffsetPathValue } from '../types';
import { createWordParser } from './word-parser';

const someType = {} as any;

describe('cached-spellchecker', () => {
  it('should get all blocks with errors', async () => {
    const pathState: OffsetPathValue[][] = [
      [
        {
          path: ['text'],
          parentFieldTypes: [],
          offset: 0,
          value: 'aaa bbb ccc',
          type: someType,
        },
      ],
      [
        {
          path: ['blocks'],
          parentFieldTypes: [],
          blockFieldPath: ['blocks'],
          offset: 0,
          value: 'span span-1 aaa',
          type: someType,
        },
        {
          path: ['blocks'],
          parentFieldTypes: [],
          blockFieldPath: ['blocks'],
          offset: 0,
          value: 'span span-2 bbb',
          type: someType,
        },
      ],
    ];

    const spellchecker = new CachedSpellchecker({
      // eslint-disable-next-line require-await
      spellcheckService: async () => {
        return [
          {
            word: 'aaa',
            suggestions: ['AAA'],
          },
          {
            word: 'bbb',
            suggestions: ['BBB'],
          },
          {
            word: 'span',
            suggestions: ['div'],
          },
        ];
      },
    });

    const result = await getMisspelledWords({
      pathState,
      wordChecker: spellchecker.spellcheck,
      wordParser: createWordParser(),
      language: { code: 'lang', title: 'Language' },
    });
    const expected: MisspelledWords = {
      aaa: {
        blocks: [
          { block: pathState[0][0], startPosition: 0, word: 'aaa' },
          { block: pathState[1][0], startPosition: 12, word: 'aaa' },
        ],
        suggestions: ['AAA'],
      },
      bbb: {
        blocks: [
          { block: pathState[0][0], startPosition: 4, word: 'bbb' },
          { block: pathState[1][1], startPosition: 12, word: 'bbb' },
        ],
        suggestions: ['BBB'],
      },
      span: {
        blocks: [
          { block: pathState[1][0], startPosition: 0, word: 'span' },
          { block: pathState[1][0], startPosition: 5, word: 'span' },
          { block: pathState[1][1], startPosition: 0, word: 'span' },
          { block: pathState[1][1], startPosition: 5, word: 'span' },
        ],
        suggestions: ['div'],
      },
    };

    expect(result).toEqual(expected);
  });
});
