import uniq from 'lodash/uniq';
import chunk from 'lodash/chunk';
import {
  Language,
  SpellcheckJob,
  SpellcheckProgress,
  SpellcheckProgressCallback,
  SpellcheckResult,
  SpellcheckService,
  SpellcheckTask,
  WordMap,
  WordSpelling,
} from '../types';

const DEFAULT_MAX_WORD_PER_REQUEST = 20;
const DEFAULT_MAX_CONCURRENT_REQUESTS = 5;

export interface CachedSpellcheckerConfig {
  spellcheckService: SpellcheckService;
  maxWordsPerRequest?: number;
  maxConcurrentRequests?: number;
}

type WordCache = Map<string, WordSpelling>;

interface SpellcheckJobState {
  words: string[];
  requestWords: string[];
  failedWords: string[];
  resolvedWords: WordMap;
  progress: SpellcheckProgressCallback;
  wordSuggestions: WordCache;
}

export class CachedSpellchecker {
  private cachedLang = 'none';
  private wordSuggestions: WordCache;
  private readonly config: CachedSpellcheckerConfig;

  constructor(config: CachedSpellcheckerConfig) {
    this.config = config;
    this.wordSuggestions = new Map<string, WordSpelling>();
  }

  // eslint-disable-next-line require-await
  spellcheck = async (spellcheckJob: SpellcheckJob): Promise<WordMap> => {
    const langcode = spellcheckJob.language.code;
    if (langcode !== this.cachedLang) {
      this.cachedLang = langcode;
      this.clearCache();
    }

    return spellcheckWords({
      ...spellcheckJob,
      config: this.config,
      wordSuggestions: this.wordSuggestions,
    });
  };

  clearCache = () => {
    this.wordSuggestions.clear();
  };
}

async function spellcheckWords(
  args: SpellcheckJob & {
    config: CachedSpellcheckerConfig;
    wordSuggestions: WordCache;
  }
): Promise<WordMap> {
  // eslint-disable-next-line no-empty-function
  const { language, progress = () => {}, wordSuggestions, config } = args;
  let words = uniq(args.words);
  words = words.filter(Boolean);

  // headsup: the values in this object are mutated
  const spellcheckState: SpellcheckJobState = {
    words,
    failedWords: [],
    resolvedWords: {},
    requestWords: [],
    progress,
    wordSuggestions,
  };

  resolveCachedWords(spellcheckState);

  const batchedConcurrentTasks = createConcurrentSpellcheckTasks(
    spellcheckState.requestWords,
    language,
    config
  );
  await runSpellcheckTasks(batchedConcurrentTasks, spellcheckState);

  finalizeResolvedWords(spellcheckState);

  return spellcheckState.resolvedWords;
}

function resolveCachedWords({
  words,
  resolvedWords,
  requestWords,
  progress,
  wordSuggestions,
}: SpellcheckJobState) {
  words.forEach((word) => {
    const cached = wordSuggestions.get(word);
    if (cached) {
      resolvedWords[word] = cached;
    } else {
      requestWords.push(word);
    }
  });

  progress(
    calcProgress({
      wordsChecked: words.length - requestWords.length,
      totalWords: words.length,
      failedWords: 0,
    })
  );
}

async function runSpellcheckTasks(
  batchedConcurrentTasks: SpellcheckTask[][],
  state: SpellcheckJobState
) {
  for (const taskBatch of batchedConcurrentTasks) {
    const concurrentSpellcheckTasks: Promise<void>[] = taskBatch.map(async function (
      spellcheckTask
    ) {
      const result = await spellcheckTask();
      handleSpellcheckResult(result, state);
    });
    await Promise.all(concurrentSpellcheckTasks);
  }
}

function handleSpellcheckResult(
  result: SpellcheckResult,
  { words, requestWords, failedWords, resolvedWords, progress, wordSuggestions }: SpellcheckJobState
) {
  if (typeof result === 'object' && 'failedWords' in result) {
    result.failedWords.forEach((word) => {
      requestWords.splice(requestWords.indexOf(word), 1);
      failedWords.push(word);
    });
  } else {
    result.forEach(({ word, suggestions }) => {
      requestWords.splice(requestWords.indexOf(word), 1);
      const spelling = {
        word,
        suggestions,
        isCorrect: false,
      } as const;
      wordSuggestions.set(word, spelling);
      resolvedWords[word] = spelling;
    });
  }
  progress(
    calcProgress({
      failedWords: failedWords.length,
      wordsChecked: words.length - requestWords.length,
      totalWords: words.length,
    })
  );
}

function finalizeResolvedWords({
  requestWords,
  resolvedWords,
  progress,
  words,
  failedWords,
  wordSuggestions,
}: SpellcheckJobState) {
  requestWords.forEach((word) => {
    const spelling = { word, isCorrect: true } as const;
    wordSuggestions.set(word, spelling);
    resolvedWords[word] = spelling;
  });

  progress(
    calcProgress({
      totalWords: words.length,
      wordsChecked: words.length,
      failedWords: failedWords.length,
    })
  );
}

function createConcurrentSpellcheckTasks(
  requestWords: string[],
  lang: Language,
  {
    maxConcurrentRequests = DEFAULT_MAX_CONCURRENT_REQUESTS,
    maxWordsPerRequest = DEFAULT_MAX_WORD_PER_REQUEST,
    spellcheckService,
  }: CachedSpellcheckerConfig
): SpellcheckTask[][] {
  const spellcheckBatches: SpellcheckTask[] = chunk(requestWords, maxWordsPerRequest).map(
    (wordBatch) => () => {
      const result: Promise<SpellcheckResult> = spellcheckService(wordBatch, lang).catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('Spellcheck batch failed', wordBatch, e);
        return {
          failedWords: wordBatch,
        };
      });
      return result;
    }
  );
  return chunk(spellcheckBatches, maxConcurrentRequests);
}

function calcProgress({
  totalWords,
  failedWords,
  wordsChecked,
}: Omit<SpellcheckProgress, 'percentage'>): SpellcheckProgress {
  return {
    percentage: Math.floor((wordsChecked * 100) / totalWords),
    failedWords,
    wordsChecked,
    totalWords,
  };
}
