'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef } from 'react';

const isWebmUrl = (url?: string | null) =>
  !!url && url.split('?')[0].toLowerCase().endsWith('.webm');

type Props = {
  id: number;
  src: string;
  alt: string;

  // 부모가 컨트롤
  shouldPlay: boolean;

  // in-view 감지를 위해 부모에 전달
  onMount?: (id: number, el: HTMLElement | null) => void;
  onUnmount?: (id: number) => void;
  onVideoRef?: (id: number, el: HTMLVideoElement | null) => void;

  // UX 옵션
  className?: string;
  objectClassName?: string;

  // NSFW blur 상태면 autoplay 막고 싶을 때
  disableAutoPlay?: boolean;
};

export default function MediaThumb({
  id,
  src,
  alt,
  shouldPlay,
  onMount,
  onUnmount,
  onVideoRef,
  className,
  objectClassName,
  disableAutoPlay,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isWebm = useMemo(() => isWebmUrl(src), [src]);

  useEffect(() => {
    onMount?.(id, rootRef.current);
    return () => {
      onUnmount?.(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 비디오 play/pause는 ref로 강제 제어 (autoPlay prop만 믿지 않음)
  useEffect(() => {
    if (!isWebm) return;
    const v = videoRef.current;
    if (!v) return;

    if (disableAutoPlay) {
      // NSFW 등으로 autoplay 금지
      v.pause();
      return;
    }

    if (shouldPlay) {
      // play()는 정책상 reject될 수 있으니 catch
      v.play().catch(() => {});
    } else {
      v.pause();
      // 원하면 첫 프레임 유지 위해 currentTime=0
      // v.currentTime = 0; // <- 깜빡임 싫으면 주석 유지
    }
  }, [isWebm, shouldPlay, disableAutoPlay]);

  useEffect(() => {
    if (!isWebm) return;
    onVideoRef?.(id, videoRef.current);
    return () => onVideoRef?.(id, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isWebm]);

  return (
    <div ref={rootRef} className={className}>
      {isWebm ? (
        <video
          ref={videoRef}
          className={objectClassName ?? 'w-full h-full object-cover'}
          muted
          playsInline
          loop
          preload="metadata"
        >
          <source src={src} type="video/webm" />
        </video>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className={objectClassName ?? 'object-cover'}
          unoptimized
        />
      )}
    </div>
  );
}
