import React, { useCallback, useState } from 'react';
import { Flex } from '@sanity/ui';
import { ObjectSchemaType, SanityDocument } from 'sanity';
import { SpellcheckDialog } from './dialog/SpellcheckDialog';
import { ContextProviders } from './SpellcheckContext';
import { SpellcheckButtonTooltips } from './SpellcheckButtonTooltips';
import { LanguageConfig, SpellcheckButton } from './SpellcheckButton';
import { getMisspelledWords } from '../../core/words/misspelled-words';
import { Language, WordChecker, WordParser } from '../../core/types';
import { useSpellcheckReducer } from '../reducer/spellcheck-reducer';
import { getSpellcheckedValues } from '../../core/document/document-spellcheck-values';

export interface ConfiguredSpellcheckButtonProps {
  document: SanityDocument;
  language: LanguageConfig;
  type: ObjectSchemaType;
  wordChecker: WordChecker;
  wordParser: WordParser;
}

export function ConfiguredSpellcheckButton(props: ConfiguredSpellcheckButtonProps) {
  const [state, dispatch] = useSpellcheckReducer();
  const { words, progress } = state;
  const { document, type, language, wordChecker, wordParser } = props;
  const [currentLang, setCurrentLang] = useState<Language | undefined>();

  const runSpellcheck = useCallback(
    (lang: Language) => {
      if (progress && progress.percentage < 100) {
        return;
      }
      setCurrentLang(lang);

      dispatch({
        type: 'SPELLCHECK_PROGRESS',
        progress: { percentage: 0, wordsChecked: 0, totalWords: 0, failedWords: 0 },
      });

      // timeout to ensure "starting spellcheck" can render
      setTimeout(() => {
        const textState = getSpellcheckedValues(document, type, lang);

        getMisspelledWords({
          pathState: textState,
          language: lang,
          wordChecker,
          wordParser,
          progress: (progress) => dispatch({ type: 'SPELLCHECK_PROGRESS', progress }),
        }).then((words) => dispatch({ type: 'SPELLCHECKED_WORDS', words }));
      }, 100);
    },
    [words, dispatch, progress, document, type, language, wordChecker, wordParser]
  );

  return (
    <Flex data-testid="perform-spellcheck-container">
      <ContextProviders state={state} dispatch={dispatch}>
        <SpellcheckButtonTooltips
          progress={progress}
          retry={() => currentLang && runSpellcheck(currentLang)}
        >
          <Flex>
            <SpellcheckButton
              loading={!!progress}
              language={language}
              onLanguageSelected={runSpellcheck}
            />
          </Flex>
        </SpellcheckButtonTooltips>
        <SpellcheckDialog document={document} type={type} />
      </ContextProviders>
    </Flex>
  );
}
