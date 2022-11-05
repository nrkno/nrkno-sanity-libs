import { Block, Path, SchemaType } from 'sanity';

export interface SpellcheckResponse {
  word: string;
  suggestions: string[];
}

export interface DocumentSpellcheckOptions {
  spellcheck: boolean;
}

export interface DisablesSpellcheckOptions {
  list?: unknown;
  hidden?: unknown;
  spellcheck?: boolean | string;
}

interface WordCorrect {
  word: string;
  isCorrect: true;
  suggestions?: undefined;
}

export interface WordIncorrect {
  word: string;
  isCorrect: false;
  suggestions: string[];
}

export type WordSpelling = WordCorrect | WordIncorrect;

export interface WordMap {
  [index: string]: WordSpelling;
}

export interface SpellcheckProgress {
  percentage: number;
  failedWords: number;
  wordsChecked: number;
  totalWords: number;
}

export type SpellcheckService = (
  words: string[],
  language: Language
) => Promise<SpellcheckResponse[]>;
export type SpellcheckResult = SpellcheckResponse[] | FailedRequest;
export type SpellcheckTask = () => Promise<SpellcheckResult>;

export type WordCheckerArgs = {
  words: string[];
  language: Language;
  progress?: SpellcheckProgressCallback;
};

export type WordChecker = (args: WordCheckerArgs) => Promise<WordMap>;

export type WordParser = (pathState: OffsetPathValue[][]) => WordInBlock[];

export interface CachedSpellcheckerConfig {
  spellcheckService: SpellcheckService;
  maxWordsPerRequest?: number;
  maxConcurrentRequests?: number;
}

export interface SpellcheckJob {
  words: string[];
  language: Language;
  progress?: SpellcheckProgressCallback;
}

interface FailedRequest {
  failedWords: string[];
}

export type SpellcheckProgressCallback = (progress: SpellcheckProgress) => void;

export interface PathValue {
  type: SchemaType;
  path: Path;
  value: string;
  spellcheck?: boolean;
  parentFieldTypes: SchemaType[];

  // these are only set if the value is inside a sanity block-text array
  blockFieldPath?: Path;
  blockParentType?: SchemaType; // the array-field holding the block
  blockValue?: Block;
}

export interface OffsetPathValue extends PathValue {
  offset: number;
}

export interface WordInBlock {
  block: OffsetPathValue;
  word: string;
  startPosition: number;
}

export interface MisspelledWord {
  blocks: WordInBlock[];
  suggestions: string[];
}

export interface MisspelledWords {
  [index: string]: MisspelledWord;
}

export interface WordParserOptions {
  minWordLength: number;
  ignoreWordsWithNumbers: boolean;
  ignoreWordsInAllCaps: boolean;
  splitOn: RegExp;
}

export interface ReplaceOperation {
  pathValue: PathValue;
  startPos: number;
  replacement: string;
  textToReplace: string;
}

export interface Language {
  code: string;
  title: string;
}
