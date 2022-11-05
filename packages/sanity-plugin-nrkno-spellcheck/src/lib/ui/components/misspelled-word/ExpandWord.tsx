import React, { useCallback, useContext } from 'react';
import { Box, Button, Flex, Text } from '@sanity/ui';
import { ExpandedWordsContext, SpellcheckDispatch } from '../SpellcheckContext';
import { IOccurrenceProps } from './MisspelledWord';
import { ExpandIconDiv, ExpandWordFlex } from './ExpandWord.styled';

interface IExpandedWordProps {
  expanded: boolean;
  occurrences?: number;
  toggleExpandWord: () => void;
  clickable: boolean;
}

export function ExpandWord({ occurrences, index, occurrence }: IOccurrenceProps) {
  const expandedWords = useContext(ExpandedWordsContext);
  const dispatch = useContext(SpellcheckDispatch);

  const { word } = occurrence;
  const isExpanded = expandedWords[word];
  const canExpand = occurrences > 1;

  const toggleExpandWord = useCallback(() => {
    dispatch({ type: 'TOGGLE_EXPANDED_WORD', word });
  }, [word, dispatch]);

  const clickable = canExpand && index === 0;

  return (
    <ExpandWordComponent
      expanded={isExpanded}
      occurrences={occurrences}
      toggleExpandWord={toggleExpandWord}
      clickable={clickable}
    />
  );
}

const ExpandWordComponent = React.memo(function ExpandWordIconComp({
  expanded,
  occurrences = 0,
  toggleExpandWord,
  clickable,
}: IExpandedWordProps) {
  let Icon;

  const canExpand = occurrences > 1;
  if (!canExpand) {
    Icon = <div />;
  } else if (clickable) {
    Icon = expanded ? (
      <ExpandIconDiv aria-hidden={true}>⌄</ExpandIconDiv>
    ) : (
      <ExpandIconDiv aria-hidden={true}>›</ExpandIconDiv>
    );
  } else {
    Icon = <div aria-hidden={true}>└</div>;
  }

  return (
    <ExpandWordFlex justify="center" align="center" marginLeft={1} clickable={clickable}>
      <Button
        mode="bleed"
        padding={1}
        disabled={!clickable}
        onClick={clickable ? toggleExpandWord : undefined}
      >
        <Flex justify="center" align="center" gap={1}>
          {occurrences > 1 && clickable && !expanded ? (
            <Box>
              <Text muted width={2} size={1}>
                {`${occurrences <= 9 ? occurrences : '9+'}`}
              </Text>
            </Box>
          ) : null}
          <Box>{Icon}</Box>
        </Flex>
      </Button>
    </ExpandWordFlex>
  );
});
