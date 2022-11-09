import React, { useContext } from 'react';
import { Button, Spinner, Stack } from '@sanity/ui';
import { LoaderFlex, ReloadDiv, SpinnerDiv } from './PreviewLoading.styled';
import { DisplayTextsContext } from '../DisplayTextsContext';

interface LoadingProps {
  documentId?: string;
  loading: boolean;
  reload: () => void;
}

export function PreviewLoading({ loading, documentId, reload }: LoadingProps) {
  const { retryLoading, documentNotSaved, makeEditToPreview } = useContext(DisplayTextsContext);

  const doesNotExist = !documentId;
  return loading ? (
    <LoaderFlex align="center" justify="center">
      {doesNotExist ? (
        <Stack space={2}>
          <div>{documentNotSaved}</div>
          <div>{makeEditToPreview}</div>
        </Stack>
      ) : (
        <SpinnerDiv>
          <Spinner size={4} />
          <ReloadDiv>
            <Button text={retryLoading} onClick={reload} size={3} />
          </ReloadDiv>
        </SpinnerDiv>
      )}
    </LoaderFlex>
  ) : null;
}
