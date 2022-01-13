import React, { ForwardedRef, forwardRef, useRef } from 'react';
import {
  IFramePreviewBasic,
  IFramePreviewBasicOpts,
  IFramePreviewBasicProps,
} from './basic/IFramePreviewBasic';
import { IFrameOrientationControls } from './responsive/IFrameOrientationControls';
import { useSetRefs } from '@nrk/nrkno-sanity-react-utils';
import styles from './IFramePreview.css';

export interface IFramePreviewOpts extends IFramePreviewBasicOpts {
  /**
   * When set, buttons for forcing iframe width using width & scale transform will be shown
   * This is useful if the target app has two breakpoints for media queries that vastly different results
   * */
  desktopMinWidth?: number;
}

export type IFramePreviewProps = IFramePreviewBasicProps & {
  options: {
    /** */
    desktopMinWidth?: number;
  };
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
