import { CachedSpellchecker } from './cached-spellchecker';
import { SpellcheckResponse, WordMap } from '../types';

const allWordsOkChecker = () => jest.fn().mockResolvedValue([]);

const someLanguage = { code: 'some-lang', title: 'Some lang' };

describe('cached-word-wordChecker', () => {
  it('should return word-map with suggestions', async () => {
    const wordError: SpellcheckResponse = { word: 'a', suggestions: ['A'] };
    const spellcheckService = jest.fn().mockResolvedValue([wordError]);
    const spellchecker = new CachedSpellchecker({ spellcheckService });
    const wordMap = await spellchecker.spellcheck({
      words: ['a', 'b'],
      language: someLanguage,
    });

    const expected: WordMap = {
      a: { word: 'a', suggestions: ['A'], isCorrect: false },
      b: { word: 'b', isCorrect: true },
    };
    expect(wordMap).toEqual(expected);
  });

  it('should call spellcheckService for new words only', async () => {
    const spellcheckService = allWordsOkChecker();
    const spellchecker = new CachedSpellchecker({ spellcheckService });
    await spellchecker.spellcheck({
      words: ['a', 'b'],
      language: someLanguage,
    });
    expect(spellcheckService).toBeCalledWith(['a', 'b'], someLanguage);

    await spellchecker.spellcheck({
      words: ['a', 'b', 'c'],
      language: { code: 'some-lang', title: 'Some lang' },
    });
    expect(spellcheckService).toBeCalledWith(['c'], someLanguage);
  });

  it('should clear cache when spellcheck is another language', async () => {
    const spellcheckService = allWordsOkChecker();
    const spellchecker = new CachedSpellchecker({ spellcheckService });
    await spellchecker.spellcheck({
      words: ['a', 'b'],
      language: someLanguage,
    });
    expect(spellcheckService).toBeCalledWith(['a', 'b'], someLanguage);

    const someOtherLang = { code: 'some-other-lang', title: 'Some other lang' };
    await spellchecker.spellcheck({
      words: ['a', 'b'],
      language: someOtherLang,
    });
    expect(spellcheckService).toBeCalledWith(['a', 'b'], someOtherLang);
  });
});
