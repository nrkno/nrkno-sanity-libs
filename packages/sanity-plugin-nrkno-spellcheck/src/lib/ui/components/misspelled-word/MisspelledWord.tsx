import { Box, Checkbox, Flex, Stack, Tooltip } from '@sanity/ui';
import React, { useCallback, useContext } from 'react';
import { Correction } from './Correction';
import { ExpandedWordsContext, SpellcheckDispatch, WordContext } from '../SpellcheckContext';
import { ExpandWord } from './ExpandWord';
import { CorrectedOccurrence, CorrectedWord } from '../../reducer/spellcheck-reducer';
import { useDisplayText } from '../display-texts/DisplayTexts';
import { CheckboxDiv, CheckboxTooltipDiv, MisspelledWordCard } from './MisspelledWord.styled';

interface IProps {
  correctedWord: CorrectedWord;
  oddRow: boolean;
}

export const MisspelledWord = React.memo(function MisspelledWord({ correctedWord }: IProps) {
  const acceptedBlocks = correctedWord.blocks.filter((b) => b.accepted);
  return (
    <Stack space={0}>
      {correctedWord.blocks.map((block, i, array) => (
        <ExpandableWordOccurrence
          key={i}
          occurrence={block}
          indeterminateAccepted={
            acceptedBlocks.length !== 0 && acceptedBlocks.length !== correctedWord.blocks.length
          }
          index={i}
          occurrences={array.length}
          suggestions={correctedWord.suggestions}
        />
      ))}
    </Stack>
  );
});

export interface IOccurrenceProps {
  occurrence: CorrectedOccurrence;
  index: number;
  occurrences: number;
  suggestions: string[];
  indeterminateAccepted: boolean;
}

function ExpandableWordOccurrence(props: IOccurrenceProps) {
  const expandedWords = useContext(ExpandedWordsContext);
  const dispatch = useContext(SpellcheckDispatch);
  const wordContext = useContext(WordContext);

  const { occurrence, index, suggestions, indeterminateAccepted } = props;
  const { word } = occurrence;

  const isExpanded = expandedWords[word];
  const hidden = !isExpanded && index > 0;

  const setWordContext = useCallback(() => {
    dispatch({ type: 'SPELLCHECK_WORD_CONTEXT', context: occurrence });
  }, [occurrence, dispatch]);

  const isSelected =
    wordContext?.block === occurrence.block &&
    wordContext.startPosition === occurrence.startPosition;

  const correction = occurrence.correction;
  const toggleAcceptCorrection = useCallback(() => {
    const defaultCorrection = suggestions.length === 1 ? suggestions[0] : undefined;
    const newCorrection = correction ?? defaultCorrection;
    const isAccepted = !occurrence.accepted;
    dispatch({
      type: 'SET_CORRECTION',
      occurrence,
      accepted: isAccepted,
      closeSuggest: true,
      correction: isAccepted ? newCorrection : correction,
    });
  }, [occurrence, suggestions, dispatch, correction]);

  if (hidden) {
    return null;
  }

  return (
    <WordOccurrenceComponent
      {...props}
      selected={isSelected}
      indeterminateAccepted={!isExpanded && indeterminateAccepted}
      hasCorrection={!!occurrence.correction}
      setWordContext={setWordContext}
      toggleAcceptCorrection={toggleAcceptCorrection}
    />
  );
}

interface IOccurrenceInnerProps extends IOccurrenceProps {
  setWordContext: () => void;
  selected?: boolean;
  hasCorrection: boolean;
  toggleAcceptCorrection: () => void;
}

const WordOccurrenceComponent = React.memo(function WordOccurrenceComponent(
  props: IOccurrenceInnerProps
) {
  const { occurrence, setWordContext, selected } = props;
  const { word, startPosition } = occurrence;
  return (
    <MisspelledWordCard selected={selected}>
      <Flex key={word + startPosition} onClick={setWordContext} align="center">
        <Box padding={1}>
          <SelectCorrection {...props} />
        </Box>
        <Box>
          <ExpandWord {...props} />
        </Box>
        <Box flex={1}>
          <span style={{ cursor: 'default' }}>{occurrence.word}</span>
        </Box>
        <Box flex={2}>
          <Correction {...props} />
        </Box>
      </Flex>
    </MisspelledWordCard>
  );
});

function SelectCorrection(props: IOccurrenceInnerProps) {
  const { suggestions, hasCorrection, indeterminateAccepted, toggleAcceptCorrection, occurrence } =
    props;
  const { accepted } = occurrence;
  const disabled = suggestions?.length !== 1 && !indeterminateAccepted && !hasCorrection;

  const disabledSelectCorrectionTooltip = useDisplayText('disabledSelectCorrectionTooltip');
  const enabledSelectCorrectionTooltip = useDisplayText('enabledSelectCorrectionTooltip');
  return (
    <Tooltip
      portal
      placement="right"
      content={
        <CheckboxTooltipDiv>
          <Box padding={2}>
            {disabled ? disabledSelectCorrectionTooltip : null}
            {disabled ? null : enabledSelectCorrectionTooltip}
          </Box>
        </CheckboxTooltipDiv>
      }
    >
      <CheckboxDiv>
        <Checkbox
          indeterminate={indeterminateAccepted}
          disabled={disabled}
          checked={!!accepted}
          onChange={toggleAcceptCorrection}
        />
      </CheckboxDiv>
    </Tooltip>
  );
}
