import { ObjectSchemaType, OperationsAPI, SanityDocument, useDocumentOperation } from 'sanity';
import { ReplaceOperation } from '../types';
import { ToastParams, useToast } from '@sanity/ui';
import { get } from '@sanity/util/paths';
import React, { useCallback, useContext, useRef } from 'react';
import { createPathPatches } from './document-patch';
import { DisplayTexts, DisplayTextsContext } from '../../ui/components/display-texts/DisplayTexts';

interface CreateToastArgs {
  safeOps: ReplaceOperation[];
  replaceOps: ReplaceOperation[];
  displayTexts: DisplayTexts;
}

export function useCommitReplaceOperations(doc: SanityDocument, type: ObjectSchemaType) {
  const docOperations = useDocumentOperation(
    (doc._id || '').replace('drafts.', ''),
    type.name
  ) as OperationsAPI;

  const toast = useToast();

  const displayTexts = useRef(useContext(DisplayTextsContext));

  return useCallback(
    (replaceOps: ReplaceOperation[]) => {
      if (!replaceOps || !replaceOps.length) {
        return;
      }

      const safeOps = replaceOps.filter((op) => {
        const currentValue = get(doc, op.pathValue.path);
        const valueWhenSpellcheckStarted = op.pathValue.value;
        return currentValue === valueWhenSpellcheckStarted;
      });

      const patches = createPathPatches(safeOps);
      docOperations.patch.execute(patches, doc);

      toast.push(
        spellcheckResultToast({ safeOps, replaceOps, displayTexts: displayTexts.current })
      );
    },
    [doc, docOperations, toast]
  );
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
