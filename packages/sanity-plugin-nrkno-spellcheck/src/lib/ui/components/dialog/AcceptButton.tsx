import { Box, Button, Flex, Text, Tooltip } from '@sanity/ui';
import React from 'react';
import { SpellcheckDialogProps } from './SpellcheckDialog';
import { useDisplayText } from '../display-texts/DisplayTexts';

export function AcceptButton({ acceptCount, ambiguousCount, onAccept }: SpellcheckDialogProps) {
  const acceptText = useDisplayText('acceptButtonText', acceptCount);
  const acceptTooltip = useDisplayText('acceptTooltip', acceptCount);
  const acceptAmbiguous = useDisplayText('acceptTooltipAmbiguous', ambiguousCount);

  return (
    <Tooltip
      content={
        <Box padding={2}>
          <Text muted size={2}>
            {ambiguousCount > 0 ? acceptAmbiguous : acceptTooltip}
          </Text>
        </Box>
      }
      portal
      placement="left"
    >
      <Flex>
        <Button
          text={`${acceptText}${ambiguousCount > 0 ? '*' : ''}`}
          tone={'positive'}
          disabled={ambiguousCount > 0}
          onClick={onAccept}
        />
      </Flex>
    </Tooltip>
  );
}
