import React, { ForwardedRef, forwardRef, useRef } from 'react';
import {
  IFramePreviewBasic,
  IFramePreviewBasicOpts,
  IFramePreviewBasicProps,
} from './basic/IFramePreviewBasic';
import {
  IFrameOrientationControls,
  IOrientationConfig,
} from './responsive/IFrameOrientationControls';
import { useSetRefs } from '@snorreeb/nrkno-sanity-react-utils';
import { PreviewDiv } from './IFramePreview.styled';

export type IFramePreviewOpts = IFramePreviewBasicOpts & IOrientationConfig;

export type IFramePreviewProps = IFramePreviewBasicProps & {
  options: IFramePreviewOpts;
};

export const IFramePreview = forwardRef(function IFramePreview(
  props: IFramePreviewProps,
  _forwardRef: ForwardedRef<HTMLIFrameElement>
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { options, ...restProps } = props;
  const { desktopMinWidth, ...restOptions } = options;

  const setRefs = useSetRefs(iframeRef, _forwardRef);
  return (
    <PreviewDiv ref={containerRef}>
      <IFramePreviewBasic {...restProps} options={restOptions} ref={setRefs}>
        <IFrameOrientationControls
          iframeRef={iframeRef}
          containerRef={containerRef}
          desktopMinWidth={desktopMinWidth}
        />
      </IFramePreviewBasic>
    </PreviewDiv>
  );
});
