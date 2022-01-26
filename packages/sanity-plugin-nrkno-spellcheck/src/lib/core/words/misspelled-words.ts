import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import {
  Language,
  MisspelledWords,
  OffsetPathValue,
  SpellcheckProgressCallback,
  WordChecker,
  WordIncorrect,
  WordParser,
} from '../types';

export interface MisspelledWordsArgs {
  pathState: OffsetPathValue[][];
  language: Language;
  wordChecker: WordChecker;
  wordParser: WordParser;
  progress?: SpellcheckProgressCallback;
}

export async function getMisspelledWords({
  pathState,
  language,
  wordChecker,
  wordParser,
  progress,
}: MisspelledWordsArgs): Promise<MisspelledWords> {
  const allWords = wordParser(pathState);

  const wordMap = await wordChecker({
    words: allWords.map((w) => w.word),
    language: language,
    progress,
  });

  const indexedIncorrectWords = allWords.filter((b) => {
    const correction = wordMap[b.word];
    return correction && !correction.isCorrect;
  });

  const byWord = groupBy(indexedIncorrectWords, (i) => i.word);
  return mapValues(byWord, (v, word) => ({
    blocks: v,
    suggestions: (wordMap[word] as WordIncorrect).suggestions,
  }));
}
