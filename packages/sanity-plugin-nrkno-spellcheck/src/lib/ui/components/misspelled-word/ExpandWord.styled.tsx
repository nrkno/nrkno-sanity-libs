import styled from 'styled-components';
import { Flex, Theme } from '@sanity/ui';

export const ExpandIconDiv = styled.div`
  font-size: 20px;
  margin-top: -0.25em;
`;

export const ExpandWordFlex = styled(Flex)`
  position: relative;

  & > * {
    background: none;
    width: 35px;
    box-shadow: none;
  }
  ${({ clickable, theme }: { clickable: boolean; theme: Theme }) => {
    if (clickable) {
      return `color: ${theme.sanity.color.selectable?.primary.selected.fg}`;
    }
    return '';
  }}
`;

/*

.expandWord {
  position: relative;
}

.expandWord.expandWord > * {
  background: none;
  width: 35px;
}

.clickable.clickable > button:hover {
  background: var(--selectable-item-color-highlighted);
}

.clickable.clickable > button:not(:focus-visible):not(:focus-visible) {
  box-shadow: none;
}

.notClickable.notClickable > button {
  box-shadow: none;
}

*/
