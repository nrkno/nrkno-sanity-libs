import groupBy from 'lodash/groupBy';
import { pathToString } from '@sanity/field/lib/paths';
import { PatchOperations, Path } from '@sanity/types';
import { ReplaceOperation } from '../types';

export function createPathPatch(
  originalText: string,
  path: Path,
  replaceOps: ReplaceOperation[]
): PatchOperations {
  const sortedByPos = [...replaceOps].sort((a, b) => a.startPos - b.startPos);

  let newText = originalText;
  let offset = 0;

  sortedByPos.forEach((operation) => {
    const newStart = operation.startPos + offset;

    const textBefore = newText.substring(0, newStart);
    const targetLength = operation.textToReplace.length;
    const textAfter = newText.substring(newStart + targetLength);
    newText = textBefore + operation.replacement + textAfter;

    const offsetDelta = operation.replacement.length - targetLength;

    offset += offsetDelta;
  });

  return { set: { [pathToString(path)]: newText } };
}

export function createPathPatches(ops: ReplaceOperation[]) {
  const byPath = groupBy(ops, (op) => pathToString(op.pathValue.path));
  return Object.values(byPath).map((ops) =>
    createPathPatch(ops[0].pathValue.value, ops[0].pathValue.path, ops)
  );
}
