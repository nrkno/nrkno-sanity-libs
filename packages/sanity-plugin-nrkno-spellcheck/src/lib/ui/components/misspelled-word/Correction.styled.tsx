import styled from 'styled-components';
import { Box } from '@sanity/ui';

export const SuggestListUl = styled.ul`
  max-height: 200px;
  overflow: auto;
  border-bottom: 1px solid ${({ theme }) => theme.sanity.color.selectable?.default.enabled.border};
`;

export const CorrectionBox = styled(Box)`
  max-width: 100%;
`;

export const OpenButton = styled.div`
  & > * {
    text-overflow: ellipsis;
    max-width: 100%;
    width: 100%;
    background: none;
  }

  & * {
    color: inherit;
  }

  & > *:hover {
    text-overflow: ellipsis;
    max-width: 100%;
    width: 100%;
    background: var(--selectable-item-color-highlighted);
    color: inherit;
  }

  & > *:not(:focus) {
    box-shadow: none;
  }

  & > *:focus:focus:focus {
    box-shadow: inset 0 0 0 1px #2276fc, inset 0 0 0 1px #2276fc, 0 0 0 1px #2276fc;
  }
`;

/*

/!* force :focus to act like :focus-visible *!/

.coreSuggest.coreSuggest.coreSuggest {
  width: 100%;
  top: 35px;
}

.coreSuggest.coreSuggest.coreSuggest * {
  color: rgb(33, 43, 57);
}

*/
