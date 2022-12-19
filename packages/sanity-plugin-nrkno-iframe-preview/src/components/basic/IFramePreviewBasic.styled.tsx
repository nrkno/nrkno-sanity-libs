import styled from 'styled-components';

export const PreviewDiv = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 4px);
  overflow: hidden;
`;

export const IFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  overflow-y: hidden;
  transition: opacity 0.5s ease-in-out;
  opacity: ${({ ready }: { ready: boolean }) => (ready ? '1' : '0')};
`;
