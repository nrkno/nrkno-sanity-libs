import styled from 'styled-components';
import { Box } from '@sanity/ui';

export const WordHeader = styled(Box)`
  background-color: ${({ theme }) => {
    return theme.sanity.color.selectable?.primary.pressed.bg;
  }};

  padding: 10px 0 8px;
`;
