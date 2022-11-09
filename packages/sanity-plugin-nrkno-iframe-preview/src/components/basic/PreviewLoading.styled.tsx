import styled, { keyframes } from 'styled-components';
import { Flex } from '@sanity/ui';

const reloadFadeIn = keyframes`
  0% {
    opacity: 0;
  }
  80% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

export const LoaderFlex = styled(Flex)`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100;
`;

export const SpinnerDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & svg {
    margin-left: -30px;
    margin-top: -30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.7);
  }
`;

export const ReloadDiv = styled.div`
  margin-top: 30px;
  animation: ${reloadFadeIn} 6s;
`;
