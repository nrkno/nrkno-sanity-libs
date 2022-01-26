import {
  CorrectedOccurrence,
  CorrectedWords,
  createInitialState,
  spellcheckReducer,
  SpellcheckState,
} from './spellcheck-reducer';
import { ToggleExpandedWordAction } from './spellcheck-actions';
import { OffsetPathValue, SpellcheckProgress, WordInBlock } from '../../core/types';

describe('spellcheck-reducer', () => {
  describe('SPELLCHECK_RESET_STATE', () => {
    it('should reset state', () => {
      const state = spellcheckReducer(
        { anything: 'at all, we should retain nothing' } as unknown as SpellcheckState,
        {
          type: 'SPELLCHECK_RESET_STATE',
        }
      );
      expect(state).toEqual(createInitialState());
    });
  });

  describe('SPELLCHECK_PROGRESS', () => {
    it('should update progress', () => {
      const progress: SpellcheckProgress = {
        percentage: 5,
        failedWords: 0,
        totalWords: 100,
        wordsChecked: 5,
      };
      const state = spellcheckReducer(createInitialState(), {
        type: 'SPELLCHECK_PROGRESS',
        progress: progress,
      });

      expect(state).toEqual(createState({ progress }));
    });

    it('should clear words when wordsChecked is zero', () => {
      const progress: SpellcheckProgress = {
        percentage: 0,
        failedWords: 0,
        totalWords: 0,
        wordsChecked: 0,
      };
      const initial = createState({ words: {} });
      const state = spellcheckReducer(initial, { type: 'SPELLCHECK_PROGRESS', progress: progress });

      expect(state.words).toBeUndefined();
    });

    it('should retain words when wordsChecked > 0 so we can open the dialog even when some words fail', () => {
      const progress: SpellcheckProgress = {
        percentage: 0,
        failedWords: 0,
        totalWords: 2,
        wordsChecked: 1,
      };
      const initial = createState({ words: {} });
      const state = spellcheckReducer(initial, { type: 'SPELLCHECK_PROGRESS', progress });

      expect(state.words).not.toBeUndefined();
    });
  });

  describe('SPELLCHECKED_WORDS', () => {
    it('should set words and clear progress when no failed words', () => {
      const progress: SpellcheckProgress = {
        percentage: 100,
        failedWords: 0,
        totalWords: 10,
        wordsChecked: 10,
      };
      const initialState = createState({ progress });
      const words: CorrectedWords = {
        feil: {
          blocks: [],
          suggestions: ['riktig'],
        },
      };
      const state = spellcheckReducer(initialState, { type: 'SPELLCHECKED_WORDS', words });

      expect(state.words).toEqual(words);
      expect(state.progress).toBeUndefined();
    });

    it('should set wordContext to the first block for the first word', () => {
      const block = { block: {} as OffsetPathValue, word: 'feil', startPosition: 0 };
      const words: CorrectedWords = {
        feil: {
          blocks: [block],
          suggestions: ['riktig'],
        },
      };
      const state = spellcheckReducer(createInitialState(), { type: 'SPELLCHECKED_WORDS', words });

      expect(state.wordContext).toEqual(block);
    });

    it(
      'should retain progress when there are failed words. ' +
        'Words + progress.failedWords will prevent the dialog from opening up (handled in the ui)',
      () => {
        const progress: SpellcheckProgress = {
          percentage: 100,
          failedWords: 10,
          totalWords: 100,
          wordsChecked: 100,
        };
        const initialState = createState({ progress });
        const words: CorrectedWords = {
          feil: {
            blocks: [],
            suggestions: ['riktig'],
          },
        };
        const state = spellcheckReducer(initialState, { type: 'SPELLCHECKED_WORDS', words });

        expect(state.words).toEqual(words);
        expect(state.progress).toEqual(progress);
      }
    );
  });

  describe('RESOLVE_FAILED_WORDS', () => {
    it('should clear words & progress when not accepted ', () => {
      const progress: SpellcheckProgress = {
        percentage: 100,
        failedWords: 10,
        totalWords: 100,
        wordsChecked: 100,
      };
      const words: CorrectedWords = {
        feil: {
          blocks: [],
          suggestions: ['riktig'],
        },
      };
      const initialState = createState({ progress, words });
      const state = spellcheckReducer(initialState, {
        type: 'RESOLVE_FAILED_WORDS',
        action: 'cancel',
      });

      expect(state.words).toBeUndefined();
      expect(state.progress).toBeUndefined();
    });

    it('should retain words & clear progress when accepted ', () => {
      const progress: SpellcheckProgress = {
        percentage: 100,
        failedWords: 10,
        totalWords: 100,
        wordsChecked: 100,
      };
      const words: CorrectedWords = {
        feil: {
          blocks: [],
          suggestions: ['riktig'],
        },
      };
      const initialState = createState({ progress, words });
      const state = spellcheckReducer(initialState, {
        type: 'RESOLVE_FAILED_WORDS',
        action: 'accept',
      });

      expect(state.words).toEqual(words);
      expect(state.progress).toBeUndefined();
    });
  });

  describe('SPELLCHECK_WORD_CONTEXT', () => {
    it('should keep active correction, when word context is the same word', () => {
      const activeCorrection: WordInBlock = {
        word: 'feil',
        block: {
          type: {} as any,
          parentFieldTypes: [],
          value: 'feil i streng',
          offset: 0,
          path: ['field'],
        },
        startPosition: 0,
      };
      const state = spellcheckReducer(createState({ activeCorrection }), {
        type: 'SPELLCHECK_WORD_CONTEXT',
        context: activeCorrection,
      });
      expect(state.wordContext).toEqual(activeCorrection);
      expect(state.activeCorrection).toEqual(activeCorrection);
    });

    it('should unset active correction, when word context is a different word', () => {
      const activeCorrection: WordInBlock = {
        word: 'feil',
        block: {
          type: {} as any,
          parentFieldTypes: [],
          value: 'feil i streng feil',
          offset: 0,
          path: ['field'],
        },
        startPosition: 0,
      };
      const newContext = {
        ...activeCorrection,
        startPosition: 14,
      };
      const state = spellcheckReducer(createState({ activeCorrection }), {
        type: 'SPELLCHECK_WORD_CONTEXT',
        context: newContext,
      });
      expect(state.wordContext).toEqual(newContext);
      expect(state.activeCorrection).toBeUndefined();
    });
  });

  describe('TOGGLE_EXPANDED_WORD', () => {
    it('should toggle word from undefined -> true -> false -> true', () => {
      const action: ToggleExpandedWordAction = {
        type: 'TOGGLE_EXPANDED_WORD',
        word: 'feil',
      };
      let state = spellcheckReducer(createState(), action);
      expect(state.expandedWords.feil).toEqual(true);

      state = spellcheckReducer(state, action);
      expect(state.expandedWords.feil).toEqual(false);

      state = spellcheckReducer(state, action);
      expect(state.expandedWords.feil).toEqual(true);
    });
  });

  describe('SPELLCHECK_ACTIVATE_CORRECTION', () => {
    it('should unset activeCorrection when activate is undefined', () => {
      const activeCorrection: WordInBlock = {
        word: 'feil',
        block: {
          type: {} as any,
          parentFieldTypes: [],
          value: 'feil i streng feil',
          offset: 0,
          path: ['field'],
        },
        startPosition: 0,
      };

      const state = spellcheckReducer(createState({ activeCorrection }), {
        type: 'SPELLCHECK_ACTIVATE_CORRECTION',
        activate: undefined,
      });

      expect(state.activeCorrection).toBeUndefined();
    });

    it('should set activeCorrection and wordContext', () => {
      const activeCorrection: WordInBlock = {
        word: 'feil',
        block: {
          type: {} as any,
          parentFieldTypes: [],
          value: 'feil i streng feil',
          offset: 0,
          path: ['field'],
        },
        startPosition: 0,
      };

      const state = spellcheckReducer(createState(), {
        type: 'SPELLCHECK_ACTIVATE_CORRECTION',
        activate: activeCorrection,
      });

      expect(state.activeCorrection).toEqual(activeCorrection);
      expect(state.wordContext).toEqual(activeCorrection);
    });
  });

  describe('SET_CORRECTION', () => {
    it('should set correction for single word instance', () => {
      const occurrence: CorrectedOccurrence = {
        block: {
          type: {} as any,
          parentFieldTypes: [],
          value: 'feil i streng feil',
          offset: 0,
          path: ['field'],
        },
        word: 'feil',
        startPosition: 0,
      };
      const words: CorrectedWords = {
        feil: {
          blocks: [occurrence],
          suggestions: ['riktig'],
        },
      };

      const state = spellcheckReducer(createState({ words }), {
        type: 'SET_CORRECTION',
        accepted: true,
        closeSuggest: true,
        correction: 'riktig',
        occurrence: occurrence,
      });

      expect(state.words).toEqual({
        feil: {
          blocks: [
            {
              ...occurrence,
              accepted: true,
              correction: 'riktig',
            },
          ],
          suggestions: ['riktig'],
        },
      });
    });
  });
});

function createState(override: Partial<SpellcheckState> = {}): SpellcheckState {
  return {
    ...createInitialState(),
    ...override,
  };
}
