import React from 'react';
import { SanityDocument } from '@sanity/types';
import { dummyLanguage, spellcheckService } from './dummy-spellcheck-service';
import { ObjectInputProps } from 'sanity';
import { CachedSpellchecker } from './lib/core/words/cached-spellchecker';
import { createWordParser } from './lib/core/words/word-parser';
import { ConfiguredSpellcheckButton } from './lib/ui/components/ConfiguredSpellcheckButton';

// running spellcheck twice for the same language will use cached suggestions
// this instance can be reused between components
const spellchecker = new CachedSpellchecker({ spellcheckService });

// default: words less than 3 letters, in all caps or with numbers are skipped
const wordParser = createWordParser(/*{ config is optional }*/);

export const DocumentWithSpellcheck = function Language(props: ObjectInputProps<SanityDocument>) {
  if (!props.value) {
    return null;
  }

  return (
    <>
      <ConfiguredSpellcheckButton
        type={props.schemaType}
        document={props.value}
        language={dummyLanguage}
        wordChecker={spellchecker.spellcheck}
        wordParser={wordParser}
      />
      {props.renderDefault(props)}
    </>
  );
};
