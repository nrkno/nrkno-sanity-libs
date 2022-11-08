import React, {
  Dispatch,
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDebouncedEffect } from '@snorreeb/nrkno-sanity-react-utils';
// @ts-expect-errors missing types
import CoreSuggest from '@nrk/core-suggest/jsx';
import { SuggestListUl } from './Correction.styled';
import { SuggestContainerBox, SuggestInput } from './EditCorrection.styled';

type SetCorrection = (correction: string, closeSuggest: boolean) => void;

interface IEditCorrectionProps {
  correction: string;
  setCorrection: SetCorrection;
  suggestions: string[];
}

export function EditCorrection({ correction, setCorrection, suggestions }: IEditCorrectionProps) {
  const [localValue, setLocalValue] = useState(
    correction || (suggestions.length === 1 ? suggestions[0] : '')
  );

  const inputRef = useAutoSelectionRef(localValue);
  const emitValue = useEmitValue(setLocalValue, setCorrection);
  const disableEscape = useDisableEscape(localValue, inputRef, setCorrection);
  const { addFocused, removeFocused } = useFocusCounting(setCorrection, localValue);

  const showSuggestions =
    suggestions.length > 1 || (suggestions.length === 1 && suggestions[0] !== localValue);

  const onSuggestSelect = useCallback(
    (e: { detail: HTMLElement; preventDefault: () => void }) => {
      e.preventDefault();
      const word = e.detail.getAttribute('data-id');
      if (word) {
        emitValue(word, true);
        requestAnimationFrame(() => inputRef.current?.setSelectionRange(0, word.length));
      }
    },
    [inputRef, emitValue]
  );

  const onSuggestFilter = useCallback(
    (e: any) => setLocalValue(e.target.input.value),
    [setLocalValue]
  );

  return (
    <>
      <SuggestContainerBox onKeyDown={disableEscape}>
        <CorrectionInput
          ref={inputRef}
          localValue={localValue}
          setLocalValue={setLocalValue}
          emitValue={emitValue}
          addFocused={addFocused}
          removeFocused={removeFocused}
        />
        {showSuggestions && (
          <CoreSuggest
            className={'coreSuggest'}
            onSuggestFilter={onSuggestFilter}
            onSuggestSelect={onSuggestSelect}
          >
            <SuggestListUl>
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  addFocused={addFocused}
                  removeFocused={removeFocused}
                  localValue={localValue}
                />
              ))}
            </SuggestListUl>
          </CoreSuggest>
        )}
      </SuggestContainerBox>
    </>
  );
}

interface SuggestionProps {
  suggestion: string;
  addFocused: (id: string) => void;
  removeFocused: (id: string) => void;
  localValue: string;
}

function Suggestion({ suggestion, addFocused, removeFocused, localValue }: SuggestionProps) {
  const onFocus = useCallback(() => addFocused(suggestion), [suggestion, addFocused]);
  const onBlur = useCallback(() => removeFocused(suggestion), [suggestion, removeFocused]);

  return (
    <li>
      <button data-id={suggestion} onFocus={onFocus} onBlur={onBlur}>
        <div>{suggestion}</div>
        {/* this is a hack to prevent words from being hidden when filtering*/}
        <span style={{ display: 'none' }}>{localValue}</span>
      </button>
    </li>
  );
}

interface CorrectionInputProps {
  localValue: string;
  setLocalValue: Dispatch<SetStateAction<string>>;
  addFocused: (componentId: string) => void;
  removeFocused: (componentId: string) => void;
  emitValue: (value: string, close: boolean) => void;
}

const CorrectionInput = forwardRef(function CorrectionInput(
  { localValue, addFocused, removeFocused, emitValue, setLocalValue }: CorrectionInputProps,
  inputRef: ForwardedRef<HTMLInputElement>
) {
  return (
    <SuggestInput
      ref={inputRef}
      style={{ height: '35px' }}
      type="text"
      value={localValue}
      onClick={() =>
        typeof inputRef !== 'function' && inputRef?.current?.setSelectionRange(0, localValue.length)
      }
      onFocus={() => addFocused('input')}
      onBlur={() => {
        emitValue(localValue, false);
        removeFocused('input');
      }}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          emitValue(localValue, true);
        }
      }}
      onChange={(event) => setLocalValue(event.currentTarget.value)}
    />
  );
});

function useDisableEscape(
  localValue: string,
  inputRef: MutableRefObject<HTMLInputElement | null>,
  setCorrection: SetCorrection
) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        // disables modal being closed by escape while we have active input field
        e.preventDefault();
        e.stopPropagation();
        inputRef.current?.blur();
        setCorrection(localValue, true);
      }
    },
    [inputRef, localValue, setCorrection]
  );
}

/**
 * We want EditCorrection to close itself whenever both these are true:
 * * The input-element does not have focus
 * * The suggestion dropdown does not have focus
 *
 * To handle this, we keep track of focus & blur events in both of these, and
 * emit a close-event when we no longer has focus in either.
 * */
function useFocusCounting(setCorrection: SetCorrection, localValue: string) {
  const [focused, setFocused] = useState<string[]>([]);

  const addFocused = useCallback(
    (id: string) => setFocused((current) => [...current, id]),
    [setFocused]
  );
  const removeFocused = useCallback(
    (id: string) => setFocused((current) => current.filter((el) => el !== id)),
    [setFocused]
  );

  useDebouncedEffect(
    () => {
      // closes this component when no input/button has focus anymore
      if (!focused.length) {
        setCorrection(localValue, true);
      }
    },
    [focused, localValue],
    0 // debounce with 0 delay ensures blur & focus are processed in the same tick
  );

  return {
    focused,
    addFocused,
    removeFocused,
  };
}

function useEmitValue(
  setLocalValue: Dispatch<SetStateAction<string>>,
  setCorrection: SetCorrection
) {
  return useCallback(
    (word: string, close: boolean) => {
      setLocalValue(word);
      if (word) {
        setCorrection(word, close);
      }
    },
    [setLocalValue, setCorrection]
  );
}

function useAutoSelectionRef(localValue: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(0, localValue.length);
      inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    // do not pass localValue.length here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return inputRef;
}
