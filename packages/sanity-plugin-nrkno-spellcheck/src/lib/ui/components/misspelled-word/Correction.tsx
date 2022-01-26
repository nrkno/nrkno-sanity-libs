import { Box, Button } from '@sanity/ui';
import React, { SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import styles from './Correction.css';
import { IOccurrenceProps } from './MisspelledWord';
import { ActiveCorrection, SpellcheckDispatch } from '../SpellcheckContext';
import { useCurrentPrevious } from '@nrk/nrkno-sanity-react-utils';
import { EditCorrection } from './EditCorrection';
import { SpellcheckAction } from '../../reducer/spellcheck-actions';
import { CorrectedOccurrence } from '../../reducer/spellcheck-reducer';

export function Correction({ suggestions, occurrence }: IOccurrenceProps) {
  const activeCorrection = useContext(ActiveCorrection);
  const dispatch = useContext(SpellcheckDispatch);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const setActive = useSetActive(dispatch, occurrence);
  const setCorrection = useSetCorrection(dispatch, occurrence);

  const { correction } = occurrence;
  const isActive = useCurrentPrevious(
    activeCorrection?.block === occurrence.block &&
      activeCorrection.startPosition === occurrence.startPosition
  );

  useEffect(() => {
    const wasActive = !isActive.current && isActive.prev;
    if (wasActive && !activeCorrection) {
      buttonRef.current?.focus();
    }
  }, [isActive.current, activeCorrection]);

  const label = correction || suggestions.join(' / ') || '?';
  return useMemo(() => {
    return (
      <Box className={styles.correction}>
        {!isActive.current && (
          <div className={styles.openButton}>
            <Button
              mode="bleed"
              justify="flex-start"
              text={label}
              onClick={setActive}
              ref={buttonRef}
              color={'inherit'}
              style={{ height: 35 }}
            />
          </div>
        )}
        {isActive.current && (
          <EditCorrection
            correction={correction || ''}
            setCorrection={setCorrection}
            suggestions={suggestions}
          />
        )}
      </Box>
    );
  }, [isActive, setActive, setCorrection, correction, label, suggestions]);
}

function useSetActive(dispatch: React.Dispatch<SpellcheckAction>, occurrence: CorrectedOccurrence) {
  return useCallback(
    (e: SyntheticEvent) => {
      dispatch({ type: 'SPELLCHECK_ACTIVATE_CORRECTION', activate: occurrence });
      e.preventDefault();
      e.stopPropagation();
    },
    [dispatch, occurrence]
  );
}

function useSetCorrection(
  dispatch: React.Dispatch<SpellcheckAction>,
  occurrence: CorrectedOccurrence
) {
  return useCallback(
    (correction: string, closeSuggest: boolean) => {
      dispatch({
        type: 'SET_CORRECTION',
        occurrence,
        correction,
        accepted: !!correction,
        closeSuggest,
      });
    },
    [dispatch, occurrence]
  );
}
