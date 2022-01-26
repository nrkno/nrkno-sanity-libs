import { CorrectedOccurrence, CorrectedWords } from './spellcheck-reducer';
import { SpellcheckProgress, WordInBlock } from '../../core/types';

interface SpellcheckProgressAction {
  type: 'SPELLCHECK_PROGRESS';
  progress: SpellcheckProgress;
}

interface SetWordsAction {
  type: 'SPELLCHECKED_WORDS';
  words: CorrectedWords;
}

interface ResolveFailedWordsAction {
  type: 'RESOLVE_FAILED_WORDS';
  action: 'accept' | 'retry' | 'cancel';
}

interface ResetStateAction {
  type: 'SPELLCHECK_RESET_STATE';
}

export interface ShowWordContextAction {
  type: 'SPELLCHECK_WORD_CONTEXT';
  context: WordInBlock;
}

export interface ActivateReplacementInputAction {
  type: 'SPELLCHECK_ACTIVATE_CORRECTION';
  activate: WordInBlock | undefined;
}

export interface ToggleExpandedWordAction {
  type: 'TOGGLE_EXPANDED_WORD';
  word: string;
}

export interface SetCorrectionAction {
  type: 'SET_CORRECTION';
  occurrence: CorrectedOccurrence;
  correction?: string;
  closeSuggest: boolean;
  accepted: boolean;
}

export type SpellcheckAction =
  | SpellcheckProgressAction
  | SetWordsAction
  | ResolveFailedWordsAction
  | ResetStateAction
  | ShowWordContextAction
  | ActivateReplacementInputAction
  | ToggleExpandedWordAction
  | SetCorrectionAction;
