import styled from 'styled-components';

/* force :focus to act like :focus-visible */
export const MisspelledWordDiv = styled.div`
  & input:focus:focus:focus {
    box-shadow: inset 0 0 0 1px #2276fc, inset 0 0 0 1px #2276fc, 0 0 0 1px #2276fc;
  }

  :not(:first-child) {
    background-color: aliceblue;
  }

  ${({ selected }: { selected?: boolean }) =>
    selected
      ? `
  background-color: #d2e3feff;
  box-sizing: border-box;`
      : ''}
`;

export const CheckboxDiv = styled.div`
  margin-top: 5px;
  margin-left: 5px;
`;

export const CheckboxTooltipDiv = styled.div`
  max-width: 250px;
`;
