import React, { PropsWithChildren } from 'react';
import { SpellcheckAction } from '../reducer/spellcheck-actions';
import { SpellcheckProgress, WordInBlock } from '../../core/types';
import { CorrectedWords, ExpandedWords, SpellcheckState } from '../reducer/spellcheck-reducer';

// eslint-disable-next-line no-empty-function
export const SpellcheckDispatch = React.createContext<React.Dispatch<SpellcheckAction>>(() => {});
export const ProgressContext = React.createContext<SpellcheckProgress | undefined>(undefined);
export const WordsContext = React.createContext<CorrectedWords | undefined>(undefined);
export const WordContext = React.createContext<WordInBlock | undefined>(undefined);
export const ActiveCorrection = React.createContext<WordInBlock | undefined>(undefined);
export const ExpandedWordsContext = React.createContext<ExpandedWords>({});

/**
 * The root state object is a new instance every update.
 * If we use a single context, everything has to re-render every update.
 * This can be very slow when there are hundreds of misspelled words.
 *
 * To improve performance, the state is split into multiple contexts.
 * When actions are dispatched, this limits which part of the tree has to be re-rendered,
 * since parts of the state that did NOT change will be the same instance.
 */
export function ContextProviders({
  state,
  dispatch,
  children,
}: PropsWithChildren<{ state: SpellcheckState; dispatch: React.Dispatch<SpellcheckAction> }>) {
  return (
    <SpellcheckDispatch.Provider value={dispatch}>
      <ProgressContext.Provider value={state.progress}>
        <WordsContext.Provider value={state.words}>
          <WordContext.Provider value={state.wordContext}>
            <ActiveCorrection.Provider value={state.activeCorrection}>
              <ExpandedWordsContext.Provider value={state.expandedWords}>
                {children}
              </ExpandedWordsContext.Provider>
            </ActiveCorrection.Provider>
          </WordContext.Provider>
        </WordsContext.Provider>
      </ProgressContext.Provider>
    </SpellcheckDispatch.Provider>
  );
}
