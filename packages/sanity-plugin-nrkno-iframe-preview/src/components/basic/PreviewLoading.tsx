import React, { useContext } from 'react';
import { Button, Flex, Spinner, Stack } from '@sanity/ui';
import styles from './PreviewLoading.css';
import { DisplayTextsContext } from '../DisplayTextsContext';

interface LoadingProps {
  documentId?: string;
  loading: boolean;
  reload: () => void;
}

export function PreviewLoading({ loading, documentId, reload }: LoadingProps) {
  const { retryLoading, documentNotSaved, makeEditToPreview } = useContext(DisplayTextsContext);

  return loading ? (
    <Flex align="center" justify="center" className={styles.loader}>
      {!documentId ? (
        <Stack space={2}>
          <div>{documentNotSaved}</div>
          <div>{makeEditToPreview}</div>
        </Stack>
      ) : (
        <div className={styles.spinner}>
          <Spinner size={4} />
          <div className={styles.reload}>
            <Button text={retryLoading} onClick={reload} size={3} />
          </div>
        </div>
      )}
    </Flex>
  ) : null;
}
