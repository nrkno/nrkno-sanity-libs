import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import React from 'react';
import { useDisplayText } from '../display-texts/DisplayTexts';

export function NoSpellcheckErrors({ onClose }: { onClose: () => void }) {
  const noErrorsText = useDisplayText('noErrors');
  return (
    <Card padding={4} tone="positive" data-testid="spellcheck-no-errors">
      <Stack space={2}>
        <Flex align="center" justify="center">
          <span style={{ marginRight: '5px', fontSize: 40, color: '#3ab667' }}>✓</span>
          <Text>{noErrorsText}</Text>
        </Flex>
        <Flex justify="flex-end">
          <Box>
            <Button text="Lukk" onClick={onClose} />
          </Box>
        </Flex>
      </Stack>
    </Card>
  );
}
