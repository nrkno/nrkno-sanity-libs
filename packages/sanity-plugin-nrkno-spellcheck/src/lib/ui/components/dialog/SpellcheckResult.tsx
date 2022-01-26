import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import styles from './SpellcheckDialog.css';
import { MisspelledWord } from '../misspelled-word/MisspelledWord';
import { ContextualizeSelectedWord } from './ContextualizeSelectedWord';
import { AcceptButton } from './AcceptButton';
import React from 'react';
import { SpellcheckDialogProps } from './SpellcheckDialog';
import { useDisplayText } from '../display-texts/DisplayTexts';

export function SpellcheckResult(props: SpellcheckDialogProps) {
  const { words, onClose } = props;
  const cancelText = useDisplayText('cancelButtonText');

  const foundWordsText = useDisplayText('foundWordsTableText', Object.keys(words).length);
  const changeWordText = useDisplayText('changeWordTableText');

  return (
    <Flex direction="column" style={{ maxHeight: '100%' }} data-testid="spellcheck-dialog">
      <Card
        padding={4}
        style={{
          flexShrink: 10,
          overflowY: 'auto',
          borderBottom: '1px solid rgba(93, 113, 145, 0.25)',
          maxHeight: '500px',
          minHeight: '260px',
        }}
        data-testid="spellcheck-word-table"
      >
        <Stack space={0}>
          <div className={styles.wordsHeader}>
            <Flex align="center" padding={1}>
              <Box style={{ marginLeft: '65px' }} flex={1}>
                <Text size={1}>
                  <strong>{foundWordsText}</strong>
                </Text>
              </Box>
              <Box style={{ marginLeft: '20px' }} flex={2}>
                <Text size={1}>
                  <strong>{changeWordText}</strong>
                </Text>
              </Box>
            </Flex>
          </div>
          {Object.entries(words).map(([key, correctedWord], index) => (
            <MisspelledWord key={key} correctedWord={correctedWord} oddRow={index % 2 === 1} />
          ))}
        </Stack>
      </Card>
      <Flex direction="column" justify="space-between">
        <ContextualizeSelectedWord />
        <Flex justify="space-between" padding={4} style={{ justifySelf: 'end' }}>
          <Box>
            <Button text={cancelText} onClick={onClose} height={1} />
          </Box>
          <Box>
            <AcceptButton {...props} />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
