import styled from 'styled-components';
import { Flex } from '@sanity/ui';

export const ExpandIconDiv = styled.div`
  font-size: 20px;
  margin-top: -0.25em;
`;

//TODO FIXME
export const ExpandWordFlex = styled(Flex)`
  position: relative;

  & > * {
    background: none;
    width: 35px;
  }

    ${({ clickable }: { clickable: boolean }) =>
      clickable ? 'background: var(--selectable-item-color-highlighted)' : {}}}
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
