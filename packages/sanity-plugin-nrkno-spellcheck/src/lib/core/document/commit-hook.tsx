import { ObjectSchemaType, SanityDocument } from '@sanity/types';
import { ReplaceOperation } from '../types';
import { ToastParams, useToast } from '@sanity/ui';
import { get } from '@sanity/util/lib/pathUtils';
import { OperationsAPI } from '@sanity/field/lib/diff';
import { useDocumentOperation } from '@sanity/react-hooks';
import React, { useContext, useEffect, useRef } from 'react';
import { createPathPatches } from './document-patch';
import { DisplayTexts, DisplayTextsContext } from '../../ui/components/display-texts/DisplayTexts';

interface CreateToastArgs {
  safeOps: ReplaceOperation[];
  replaceOps: ReplaceOperation[];
  displayTexts: DisplayTexts;
}

export function useCommitReplaceOperations(
  doc: SanityDocument,
  type: ObjectSchemaType,
  replaceOps: ReplaceOperation[],
  setReplaceOps: (replaceOps: ReplaceOperation[]) => void
) {
  const docOperations = useDocumentOperation(
    (doc._id || '').replace('drafts.', ''),
    type.name
  ) as OperationsAPI;

  const toast = useToast();
  const displayTexts = useRef(useContext(DisplayTextsContext));
  useEffect(() => {
    if (!replaceOps || !replaceOps.length) {
      return;
    }

    const safeOps = replaceOps.filter((op) => {
      const currentValue = get(doc, op.pathValue.path);
      const valueWhenSpellcheckStarted = op.pathValue.value;
      return currentValue === valueWhenSpellcheckStarted;
    });

    setReplaceOps([]);
    const patches = createPathPatches(safeOps);
    docOperations.patch.execute(patches);

    toast.push(spellcheckResultToast({ safeOps, replaceOps, displayTexts: displayTexts.current }));
  }, [doc, type, docOperations, replaceOps, toast]);
}

export function spellcheckResultToast({
  safeOps,
  replaceOps,
  displayTexts,
}: CreateToastArgs): ToastParams {
  if (safeOps.length !== replaceOps.length) {
    return {
      title: safeOps.length ? displayTexts.appliedPartiallyTitle : displayTexts.notAppliedTitle,
      description: (
        <>
          <p>
            <strong>{displayTexts.documentChanged}</strong>
          </p>
          <p>
            {displayTexts.discardedChanges(replaceOps.length - safeOps.length, replaceOps.length)}
          </p>
          <p>{safeOps.length > 0 ? displayTexts.appliedChanges(safeOps.length) : ''}</p>
        </>
      ),
      status: 'warning',
      duration: 300000,
      closable: true,
    };
  }
  return {
    title: displayTexts.appliedFullyTitle,
    description: <>{displayTexts.appliedChanges(safeOps.length)}</>,
    status: 'success',
  };
}
