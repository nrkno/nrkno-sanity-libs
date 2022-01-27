import { Dialog } from '@sanity/ui';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ObjectSchemaType, SanityDocument } from '@sanity/types';
import {
  ActiveCorrection,
  ProgressContext,
  SpellcheckDispatch,
  WordsContext,
} from '../SpellcheckContext';
import { SpellcheckResult } from './SpellcheckResult';
import { NoSpellcheckErrors } from './NoSpellcheckErrors';
import { ReplaceOperation } from '../../../core/types';
import { CorrectedWords } from '../../reducer/spellcheck-reducer';
import { useCommitReplaceOperations } from '../../../core/document/commit-hook';
import { useDisplayText } from '../display-texts/DisplayTexts';

interface IProps {
  document: SanityDocument;
  type: ObjectSchemaType;
}

export interface SpellcheckDialogProps {
  onClose: () => void;
  onAccept: () => void;
  words: CorrectedWords;
  acceptCount: number;
  ambiguousCount: number;
  showSuggestions: boolean;
}

const initialOps: ReplaceOperation[] = [];

export function SpellcheckDialog({ document, type }: IProps) {
  const [replaceOps, setReplaceOps] = useState(initialOps);
  const dispatch = useContext(SpellcheckDispatch);
  const words = useContext(WordsContext);
  const progress = useContext(ProgressContext);
  const activeCorrection = useContext(ActiveCorrection);

  useCommitReplaceOperations(document, type, replaceOps, setReplaceOps);

  const onClose = useCallback(() => dispatch({ type: 'SPELLCHECK_RESET_STATE' }), [dispatch]);
  const onAccept = useAcceptCorrections(words, setReplaceOps, onClose);

  const { acceptCount, ambiguousCount } = useWordCount(words);

  if (!words || progress?.failedWords) {
    return null;
  }

  return (
    <SpellcheckDialogComponent
      words={words}
      onClose={onClose}
      onAccept={onAccept}
      acceptCount={acceptCount}
      ambiguousCount={ambiguousCount}
      showSuggestions={!!activeCorrection}
    />
  );
}

function useWordCount(words?: CorrectedWords) {
  return useMemo(() => {
    if (!words) {
      return { acceptCount: 0, ambiguousCount: 0 };
    }
    const acceptedBlocks = Object.values(words)
      .flatMap((w) => w.blocks)
      .filter((b) => b.accepted);

    return {
      acceptCount: acceptedBlocks.length,
      ambiguousCount: acceptedBlocks.filter((b) => !b.correction).length,
    };
  }, [words]);
}

function useAcceptCorrections(
  words: CorrectedWords | undefined,
  setReplaceOps: (ops: ReplaceOperation[]) => void,
  onClose: () => void
) {
  return useCallback(() => {
    if (words) {
      const correctedBlocks = Object.values(words)
        .flatMap((w) => w.blocks)
        .filter((b) => !!b.correction && b.accepted);

      const ops: ReplaceOperation[] = correctedBlocks.map((b) => ({
        pathValue: b.block,
        replacement: b.correction as string,
        textToReplace: b.word,
        startPos: b.startPosition,
      }));
      setReplaceOps(ops);
    }
    onClose();
  }, [words, onClose]);
}

const SpellcheckDialogComponent = React.memo(function SpellcheckDialogComponent(
  props: SpellcheckDialogProps
) {
  const header = useDisplayText('spellcheckDialogHeader');
  const { words, onClose } = props;
  const hasErrors = !!Object.keys(words).length;
  return (
    <Dialog width={2} header={header} id="spellcheck-dialog" onClose={onClose} zOffset={10000}>
      {hasErrors && <SpellcheckResult {...props} />}
      {!hasErrors && <NoSpellcheckErrors onClose={onClose} />}
    </Dialog>
  );
});
