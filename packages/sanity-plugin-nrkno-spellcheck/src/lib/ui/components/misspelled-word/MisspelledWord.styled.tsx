import styled from 'styled-components';
import { Card, Theme } from '@sanity/ui';

/* force :focus to act like :focus-visible */
export const MisspelledWordCard = styled(Card)`
  & input:focus:focus:focus {
    box-shadow: inset 0 0 0 1px #2276fc, inset 0 0 0 1px #2276fc, 0 0 0 1px #2276fc;
  }

  :not(:first-child) {
    background-color: ${({ theme }) => theme.sanity.color.input.default.disabled.bg2};
  }

  &&& {
    ${({ theme, selected }: { theme: Theme; selected?: boolean }) =>
      selected
        ? `
          background-color: ${theme.sanity.color.selectable?.primary.selected.bg};
          color: ${theme.sanity.color.selectable?.primary.selected.fg};
        `
        : ''}
  }

  box-sizing: border-box;

  & :hover {
    background-color: ${({ theme }) => theme.sanity.color.selectable?.primary.hovered.bg};
    color: ${({ theme }) => theme.sanity.color.selectable?.primary.hovered.fg};
  }
`;

export const CheckboxDiv = styled.div`
  margin-top: 5px;
  margin-left: 5px;
`;

export const CheckboxTooltipDiv = styled.div`
  max-width: 250px;
`;
