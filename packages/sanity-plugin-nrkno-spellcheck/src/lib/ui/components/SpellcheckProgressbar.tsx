import React from 'react';
import { SpellcheckProgress } from '../../core/types';
import { useDisplayText } from './display-texts/DisplayTexts';

export function SpellcheckProgressbar({ progress }: { progress?: SpellcheckProgress }) {
  if (!progress) {
    return null;
  }
  if (progress.totalWords === 0) {
    return <Starting />;
  }
  return <ProgressText progress={progress} />;
}

function Starting() {
  return <div>{useDisplayText('startingSpellcheck')}</div>;
}

function ProgressText({ progress }: { progress: SpellcheckProgress }) {
  return (
    <div>
      {useDisplayText(
        'progressText',
        progress.wordsChecked,
        progress.totalWords,
        progress.percentage
      )}
    </div>
  );
}
