import React, { useCallback, useContext } from 'react';
import styles from './ExpandWord.css';
import { Box, Button, Flex, Text } from '@sanity/ui';
import { ExpandedWordsContext, SpellcheckDispatch } from '../SpellcheckContext';
import { IOccurrenceProps } from './MisspelledWord';
import { classNames } from '../../../core/helpers';

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
      <div aria-hidden={true} className={styles.expandedIcon}>
        ⌄
      </div>
    ) : (
      <div aria-hidden={true} className={styles.expandIcon}>
        ›
      </div>
    );
  } else {
    Icon = <div aria-hidden={true}>└</div>;
  }

  return (
    <Flex
      justify="center"
      align="center"
      marginLeft={1}
      className={classNames(styles.expandWord, clickable ? styles.clickable : styles.notClickable)}
    >
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
    </Flex>
  );
});
