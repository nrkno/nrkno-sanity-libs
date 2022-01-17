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
import { useSetRefs } from '@nrk/nrkno-sanity-react-utils';
import styles from './IFramePreview.css';

export type IFramePreviewOptions = IFramePreviewBasicOpts & IOrientationConfig;

export type IFramePreviewProps = IFramePreviewBasicProps & {
  options: IFramePreviewOptions;
};

export const IFramePreview = forwardRef(function IFramePreview(
  props: IFramePreviewProps,
  forwardRef: ForwardedRef<HTMLIFrameElement>
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { options, ...restProps } = props;
  const { desktopMinWidth, ...restOptions } = options;

  const setRefs = useSetRefs(iframeRef, forwardRef);
  return (
    <div ref={containerRef} className={styles.preview}>
      <IFramePreviewBasic {...restProps} options={restOptions} ref={setRefs}>
        <IFrameOrientationControls
          iframeRef={iframeRef}
          containerRef={containerRef}
          desktopMinWidth={desktopMinWidth}
        />
      </IFramePreviewBasic>
    </div>
  );
});
