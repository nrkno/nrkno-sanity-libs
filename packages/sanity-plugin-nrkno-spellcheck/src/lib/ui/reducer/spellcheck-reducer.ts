import { useReducer } from 'react';
import { SetCorrectionAction, SpellcheckAction } from './spellcheck-actions';
import { SpellcheckProgress, WordInBlock } from '../../core/types';

export interface Correction {
  correction?: string;
  accepted?: boolean;
}

export type CorrectedOccurrence = WordInBlock & Correction;

export interface CorrectedWord {
  blocks: CorrectedOccurrence[];
  suggestions: string[];
}
export interface CorrectedWords {
  [index: string]: CorrectedWord;
}

export type ExpandedWords = Record<string, boolean>;

export interface SpellcheckState {
  progress?: SpellcheckProgress;
  words?: CorrectedWords;
  wordContext?: WordInBlock;
  activeCorrection?: WordInBlock;
  expandedWords: ExpandedWords;
}

export function createInitialState(): SpellcheckState {
  return {
    expandedWords: {},
  };
}

export function spellcheckReducer(
  state: SpellcheckState,
  action: SpellcheckAction
): SpellcheckState {
  switch (action.type) {
    case 'SPELLCHECK_PROGRESS':
      return {
        ...state,
        words: action.progress.wordsChecked === 0 ? undefined : state.words,
        progress: action.progress,
      };
    case 'SPELLCHECKED_WORDS':
      return {
        ...state,
        wordContext: Object.values(action.words)[0]?.blocks[0],
        words: action.words,
        progress: state.progress?.failedWords ? state.progress : undefined,
      };
    case 'RESOLVE_FAILED_WORDS':
      return {
        ...state,
        words: action.action === 'accept' ? state.words : undefined,
        progress: undefined,
      };
    case 'SPELLCHECK_WORD_CONTEXT':
      return wordContext(state, action.context);
    case 'TOGGLE_EXPANDED_WORD':
      return {
        ...state,
        expandedWords: {
          ...state.expandedWords,
          [action.word]: !state.expandedWords[action.word],
        },
      };
    case 'SPELLCHECK_ACTIVATE_CORRECTION':
      return {
        ...wordContext(state, action.activate),
        activeCorrection: action.activate,
      };
    case 'SET_CORRECTION':
      return setCorrection(state, action);
    case 'SPELLCHECK_RESET_STATE':
      return createInitialState();
    default:
      return state;
  }
}

function wordContext(state: SpellcheckState, block?: WordInBlock): SpellcheckState {
  if (!block) {
    return {
      ...state,
      activeCorrection: undefined,
    };
  }
  const keepInputOpen =
    block.word === state.activeCorrection?.word &&
    block.startPosition === state.activeCorrection?.startPosition;
  return {
    ...state,
    wordContext: block,
    activeCorrection: keepInputOpen ? state.activeCorrection : undefined,
  };
}

function setCorrection(
  state: SpellcheckState,
  { occurrence, correction, accepted, closeSuggest }: SetCorrectionAction
): SpellcheckState {
  if (!state.words) {
    return state;
  }
  const replace = state.words[occurrence.word];
  const isExpanded = state.expandedWords[occurrence.word];
  const newWords = {
    ...state.words,
    [occurrence.word]: {
      ...replace,
      blocks: replace.blocks.map((b) => {
        if (
          (b.block === occurrence.block && b.startPosition === occurrence.startPosition) ||
          (!isExpanded && !b.correction)
        ) {
          const newCorrection = correction ?? undefined;
          return {
            ...b,
            correction: newCorrection,
            accepted: accepted && !!newCorrection,
          };
        } else if (isExpanded) {
          return b;
        }
        return { ...b, accepted };
      }),
    },
  };
  return {
    ...state,
    activeCorrection: closeSuggest ? undefined : state.activeCorrection,
    words: newWords,
  };
}

export function useSpellcheckReducer() {
  return useReducer(spellcheckReducer, undefined, createInitialState);
}
