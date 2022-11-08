import { Language, SpellcheckResponse, SpellcheckService } from './lib/core/types';

export const dummyLanguage = {
  code: 'dummy',
  title: 'Dummy language',
};

const suggestions = ['slim', 'pickings'];

// eslint-disable-next-line func-name-matching,require-await
export const spellcheckService: SpellcheckService = async function dummy(
  words: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language: Language
): Promise<SpellcheckResponse[]> {
  return words.filter((word) => !suggestions.includes(word)).map((word) => ({ word, suggestions }));
};
