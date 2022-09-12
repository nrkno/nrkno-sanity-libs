import React, { PropsWithChildren, useCallback, useContext } from 'react';
import { Box, Button, Card, Flex, Label, Popover, Stack, Tooltip, TooltipProps } from '@sanity/ui';
import { SpellcheckDispatch } from './SpellcheckContext';
import { SpellcheckProgressbar } from './SpellcheckProgressbar';
import { SpellcheckProgress } from '../../core/types';
import { useDisplayText } from './display-texts/DisplayTexts';

interface ITooltipProps {
  progress?: SpellcheckProgress;
  retry: () => void;
}

export function SpellcheckButtonTooltips({
  progress,
  children,
  retry,
}: PropsWithChildren<ITooltipProps>) {
  const inner = <Flex>{children}</Flex>;

  if (progress && progress.percentage >= 100 && !progress.failedWords) {
    return inner;
  } else if (progress) {
    return (
      <Popover
        content={<SpellcheckPopoverText progress={progress} retry={retry} />}
        portal
        placement="bottom"
        open
      >
        {inner}
      </Popover>
    );
  }

  return inner;
}

interface IPopoverProps {
  progress: SpellcheckProgress;
  retry: () => void;
}

function SpellcheckPopoverText({ progress, retry }: IPopoverProps) {
  return (
    <Card
      padding={progress.failedWords ? 4 : 2}
      tone={progress.failedWords ? 'caution' : 'default'}
    >
      {progress.percentage < 100 || !progress.failedWords ? (
        <SpellcheckProgressbar progress={progress} />
      ) : (
        <SpellcheckErrorBox retry={retry} progress={progress} />
      )}
    </Card>
  );
}

function SpellcheckErrorBox({ retry, progress }: IPopoverProps) {
  const dispatch = useContext(SpellcheckDispatch);

  const cancel = useCallback(() => {
    dispatch({ type: 'RESOLVE_FAILED_WORDS', action: 'cancel' });
  }, [dispatch]);

  const accept = useCallback(() => {
    dispatch({ type: 'RESOLVE_FAILED_WORDS', action: 'accept' });
  }, [dispatch]);

  const totalWordsLabel = useDisplayText('totalWordsLabel', progress.totalWords);
  const failedWordsText = useDisplayText('failedWordsText', progress.failedWords);

  const retryButtonText = useDisplayText('retryButtonText');
  const retryButtonTooltips = useDisplayText('retryButtonTooltips');
  const ignoreErrorButton = useDisplayText('ignoreErrorButton');
  const ignoreErrorButtonTooltips = useDisplayText('ignoreErrorButtonTooltips');
  const abortErrorButton = useDisplayText('abortErrorButton');
  const abortErrorButtonTooltips = useDisplayText('abortErrorButtonTooltips');

  return (
    <Stack space={4}>
      <Stack space={2}>
        <Label>{totalWordsLabel}</Label>
        <div>{failedWordsText}</div>
      </Stack>
      <Flex justify="center">
        <BottomTooltip content={<Box padding={2}>{retryButtonTooltips}</Box>}>
          <Button onClick={retry}>{retryButtonText}</Button>
        </BottomTooltip>
        <Box marginLeft={1}>
          <BottomTooltip content={<Box padding={2}>{ignoreErrorButtonTooltips}</Box>}>
            <Button mode="ghost" onClick={accept}>
              {ignoreErrorButton}
            </Button>
          </BottomTooltip>
        </Box>
        <Box marginLeft={1} onClick={cancel}>
          <BottomTooltip content={<Box padding={2}>{abortErrorButtonTooltips}</Box>}>
            <Button mode="ghost">{abortErrorButton}</Button>
          </BottomTooltip>
        </Box>
      </Flex>
    </Stack>
  );
}

function BottomTooltip({ children, ...props }: TooltipProps) {
  return (
    <Tooltip portal placement="bottom" {...props}>
      {children}
    </Tooltip>
  );
}
