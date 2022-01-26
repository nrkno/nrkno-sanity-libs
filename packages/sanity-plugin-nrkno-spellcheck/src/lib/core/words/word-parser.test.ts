import { stringToWords } from './word-parser';

describe('word-parser', () => {
  it('should split string into offset-addressed words', () => {
    const words = stringToWords('something, something darkside');
    expect(words).toEqual([
      { word: 'something', startPosition: 0 },
      { word: 'something', startPosition: 11 },
      { word: 'darkside', startPosition: 21 },
    ]);
  });

  it('should ignore words with two letters or less', () => {
    const words = stringToWords('so sa darkside');
    expect(words).toEqual([{ word: 'darkside', startPosition: 6 }]);
  });

  it('should ignore words with all caps', () => {
    const words = stringToWords('SOMETHING darkside');
    expect(words).toEqual([{ word: 'darkside', startPosition: 10 }]);
  });

  it('should ignore words with numbers', () => {
    const words = stringToWords('something darkside12');
    expect(words).toEqual([{ word: 'something', startPosition: 0 }]);
  });

  it('should remove symbols when splitting while retaining word position', () => {
    const words = stringToWords('something .,;:\'"$#@!/*+?{}()-&\\[]|darkside');
    expect(words).toEqual([
      { word: 'something', startPosition: 0 },
      { word: 'darkside', startPosition: 34 },
    ]);
  });
});
