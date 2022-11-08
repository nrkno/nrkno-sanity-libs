import { createContext, ReactNode, useContext, useMemo } from 'react';
import isFunction from 'lodash/isFunction';

export interface DisplayTexts {
  spellcheckDialogHeader: ReactNode;
  spellcheckButtonText: ReactNode;

  foundWordsTableText: (wordsCount: number) => ReactNode;
  changeWordTableText: ReactNode;

  wordContextHeader: ReactNode;

  acceptButtonText: (acceptCount: number) => ReactNode;
  acceptTooltip: (acceptCount: number) => ReactNode;
  acceptTooltipAmbiguous: (ambiguousCount: number) => ReactNode;

  cancelButtonText: ReactNode;

  noErrors: ReactNode;

  disabledSelectCorrectionTooltip: ReactNode;
  enabledSelectCorrectionTooltip: ReactNode;

  totalWordsLabel: (totalWords: number) => ReactNode;
  failedWordsText: (failedWords: number) => ReactNode;

  retryButtonText: ReactNode;
  retryButtonTooltips: ReactNode;
  ignoreErrorButton: ReactNode;
  ignoreErrorButtonTooltips: ReactNode;
  abortErrorButton: ReactNode;
  abortErrorButtonTooltips: ReactNode;

  startingSpellcheck: ReactNode;
  progressText: (wordsChecked: number, totalWords: number, percentageComplete: number) => ReactNode;

  appliedFullyTitle: ReactNode;
  appliedPartiallyTitle: ReactNode;
  notAppliedTitle: ReactNode;

  documentChanged: ReactNode;
  discardedChanges: (discardCount: number, totalCorrections: number) => ReactNode;
  appliedChanges: (appliedCorrections: number) => ReactNode;
}

export const defaultDisplayTexts: DisplayTexts = {
  spellcheckDialogHeader: 'Spellcheck',
  spellcheckButtonText: 'Spellcheck',

  foundWordsTableText: (wordsCount: number) => `Found ${wordsCount}`,
  changeWordTableText: 'Change to',

  wordContextHeader: 'Context',

  acceptButtonText: (acceptCount) => `Accept ${acceptCount}`,
  acceptTooltip: (acceptCount) => `Will correct ${acceptCount} selected words.`,
  acceptTooltipAmbiguous: (ambiguousCount) =>
    `${ambiguousCount} ${
      ambiguousCount > 1 ? 'corrections have' : 'correction has'
    } multiple options. Please select one.`,
  cancelButtonText: 'Cancel',

  noErrors: 'No errors found.',

  disabledSelectCorrectionTooltip:
    'You have to select a singular correction to mark this word as corrected',
  enabledSelectCorrectionTooltip: 'Only checked words will be corrected',

  totalWordsLabel: (totalWords: number) => `${totalWords} words checked`,
  failedWordsText: (failedWords: number) => `Something went wrong with ${failedWords} words.`,

  retryButtonText: 'Retry',
  retryButtonTooltips: 'Tries to rerun spellcheck.',
  ignoreErrorButton: 'Continue',
  ignoreErrorButtonTooltips: 'Opens spellcheck-results with missing results.',
  abortErrorButton: 'Cancel',
  abortErrorButtonTooltips: 'Aborts spellcheck.',

  startingSpellcheck: 'Starting spellcheck...',
  progressText: (wordsChecked: number, totalWords: number, percentageComplete: number) =>
    `${wordsChecked} of ${totalWords} unique ${pluralize(
      'word',
      totalWords
    )} checked - ${percentageComplete} %`,

  appliedFullyTitle: 'Spellcheck corrections applied',
  appliedPartiallyTitle: 'Spellcheck corrections partially applied',
  notAppliedTitle: 'Spellcheck corrections discarded',

  documentChanged: 'Document was changed after spellcheck was started.',

  discardedChanges: (discardCount: number, totalCorrections: number) =>
    `${discardCount} of ${totalCorrections} ${pluralize(
      'correction',
      totalCorrections
    )} could therefor not be applied.`,

  appliedChanges: (appliedCorrections: number) =>
    `${appliedCorrections} ${pluralize('correction', appliedCorrections)} applied.`,
};

function pluralize(word: string, count: number) {
  return word + (count > 1 ? 's' : '');
}

export const DisplayTextsContext = createContext<DisplayTexts>(defaultDisplayTexts);

export function useDisplayText<T extends keyof DisplayTexts>(
  key: T,
  ...args: DisplayTexts[T] extends (...a: any[]) => ReactNode
    ? Parameters<DisplayTexts[T]>
    : undefined[]
): ReactNode {
  const displayText = useContext(DisplayTextsContext)[key];

  return useMemo(() => {
    if (isFunction(displayText)) {
      // @ts-expect-error hard to type so hardly typed
      return displayText(...args);
    }
    if (typeof displayText === 'string') {
      return displayText;
    }
    return null;
  }, [displayText, args]);
}
