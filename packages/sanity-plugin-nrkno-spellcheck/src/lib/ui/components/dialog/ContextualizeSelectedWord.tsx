import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { WordContext } from '../SpellcheckContext';
import { Card, Stack, Text } from '@sanity/ui';
import { OffsetPathValue, WordInBlock } from '../../../core/types';
import { Block } from '@sanity/types';
import { useDisplayText } from '../display-texts/DisplayTexts';

export function ContextualizeSelectedWord() {
  const wordContext = useContext(WordContext);
  const block = wordContext?.block;
  const moreContext = useSiblingText(wordContext);
  const wordRef = useRef<HTMLDivElement>(null);

  const textBeforeWord = wordContext?.block.value.substr(0, wordContext.startPosition);
  const textAfterWord = wordContext?.block.value.substr(
    wordContext.startPosition + wordContext.word.length
  );

  useEffect(() => {
    wordRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }, [wordContext]);

  const wordContextHeader = useDisplayText('wordContextHeader');
  const title = useContextTitle(block);
  return (
    <Card
      padding={4}
      style={{ borderBottom: '1px solid rgba(93, 113, 145, 0.25)' }}
      data-testid="word-context"
    >
      {wordContext && (
        <Stack space={3}>
          <Stack space={2}>
            <Text muted size={0}>
              {wordContextHeader}
            </Text>
            <Text size={1}>
              <strong>{title}</strong>
            </Text>
          </Stack>
          <div style={{ height: '5em', maxWidth: '50em', overflowY: 'auto' }}>
            {moreContext?.before}
            {textBeforeWord}
            <strong style={{ color: 'red' }} ref={wordRef}>
              {wordContext.word}
            </strong>
            {textAfterWord}
            {moreContext?.after}
          </div>
        </Stack>
      )}
    </Card>
  );
}

function useContextTitle(block?: OffsetPathValue) {
  return useMemo(() => {
    if (!block) {
      return null;
    }

    const blockIndex = block.parentFieldTypes.findIndex((t) => t.name === 'block');
    const titlePath =
      blockIndex >= 0
        ? block.parentFieldTypes.slice(0, blockIndex)
        : [...block.parentFieldTypes, block.type];

    return titlePath
      .filter((t, i) => i > 0) // first is document schema, skip it
      .map((t) => t.title ?? t.name)
      .join(' ➞ ');
  }, [block]);
}

function useSiblingText(wordContext?: WordInBlock) {
  return useMemo(() => {
    const block = wordContext?.block;
    if (!block?.blockValue) {
      return;
    }

    const keyedSpan = block?.path.length >= 2 && block.path[block.path.length - 2];

    if (!(typeof keyedSpan === 'object' && '_key' in keyedSpan)) {
      return;
    }

    const key = keyedSpan._key;
    const children = block?.blockValue?.children;
    if (!children) {
      return;
    }

    const startIndex = children.findIndex((c) => c._key === key);
    if (startIndex < 0) {
      return;
    }
    const childrenAsString = (array: Block['children']) =>
      array?.map((child) => child.text).join('');

    return {
      before: childrenAsString(children.slice(0, startIndex)),
      after: childrenAsString(children.slice(startIndex + 1, children.length)),
    };
  }, [wordContext]);
}
