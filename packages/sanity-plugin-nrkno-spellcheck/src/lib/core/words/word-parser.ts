import { OffsetPathValue, WordInBlock, WordParser, WordParserOptions } from '../types';

export const defaultWordParserOptions: WordParserOptions = Object.freeze({
  minWordLength: 2,
  ignoreWordsWithNumbers: true,
  ignoreWordsInAllCaps: true,
  splitOn: /[\s.,;:'"$#@!/*?{}()|[\]\\&^–\-+]/,
});

export function createWordParser(options = defaultWordParserOptions): WordParser {
  return (pathState: OffsetPathValue[][]) => parseWords(pathState, options);
}

function parseWords(pathState: OffsetPathValue[][], options: WordParserOptions): WordInBlock[] {
  return pathState
    .flatMap((b) => b)
    .flatMap((block) => stringToWords(block.value, options).map((word) => ({ ...word, block })));
}

export function stringToWords(
  input: string,
  options = defaultWordParserOptions
): { word: string; startPosition: number }[] {
  const words = input.split(options.splitOn);

  let offset = 0;
  return words
    .map((word) => {
      const startPosition = offset;
      offset += word.length + 1;
      return {
        word,
        startPosition,
      };
    })
    .filter(({ word }) => word.length > options.minWordLength)
    .filter(({ word }) => !options?.ignoreWordsInAllCaps || word.toUpperCase() !== word)
    .filter(({ word }) => !options?.ignoreWordsWithNumbers || !word.match(/\d/));
}
