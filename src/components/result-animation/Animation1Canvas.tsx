'use client';

import { StartedGameResponseDto } from '@/dtos/startedGames.dtos';
import { Worldcup } from '@/dtos/worldcup.dtos';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

type Props = {
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  worldcup: Worldcup;
  finalWinnerId: number;
  finalStartedGame: StartedGameResponseDto | null;
};

export type Animation1CanvasHandle = {
  getCanvas: () => HTMLCanvasElement | null;
};

type CanvasMediaSource = HTMLImageElement | HTMLVideoElement;

const Animation1Canvas = forwardRef<Animation1CanvasHandle, Props>(
  (
    {
      finalStartedGame,
      onAnimationStart,
      onAnimationEnd,
      worldcup,
      finalWinnerId,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const titleRef = useRef('');
    const charIndexRef = useRef(0);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    function getMediaDimensions(source: CanvasMediaSource) {
      if (source instanceof HTMLVideoElement) {
        return {
          width: source.videoWidth,
          height: source.videoHeight,
        };
      }

      return {
        width: source.width,
        height: source.height,
      };
    }

    function drawImageCover(
      ctx: CanvasRenderingContext2D,
      source: CanvasMediaSource,
      dx: number,
      dy: number,
      dWidth: number,
      dHeight: number
    ) {
      const { width, height } = getMediaDimensions(source);
      const imgAspect = width / height;
      const boxAspect = dWidth / dHeight;

      let sx = 0,
        sy = 0,
        sWidth = width,
        sHeight = height;

      if (imgAspect > boxAspect) {
        // Image is wider, crop sides
        sWidth = height * boxAspect;
        sx = (width - sWidth) / 2;
      } else {
        // Image is taller, crop top/bottom
        sHeight = width / boxAspect;
        sy = (height - sHeight) / 2;
      }

      ctx.drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }

    function isDirectVideoUrl(url: string, isVideo: boolean, videoSource?: string) {
      return (
        isVideo &&
        videoSource !== 'youtube' &&
        /\.(webm|mp4|mov|m4v|ogg)(\?.*)?$/i.test(url)
      );
    }

    async function loadCanvasSource(
      url: string,
      options?: {
        isVideo?: boolean;
        videoSource?: string;
      }
    ): Promise<CanvasMediaSource> {
      if (
        isDirectVideoUrl(url, options?.isVideo ?? false, options?.videoSource)
      ) {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = `${url}${url.includes('?') ? '&' : '?'}canvas=true`;

        await new Promise<void>((resolve, reject) => {
          const handleLoadedData = () => {
            cleanup();
            resolve();
          };
          const handleError = () => {
            cleanup();
            reject(new Error(`Failed to load video: ${url}`));
          };
          const cleanup = () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('error', handleError);
          };

          video.addEventListener('loadeddata', handleLoadedData);
          video.addEventListener('error', handleError);
          video.load();
        });

        try {
          video.currentTime = Math.min(0.1, video.duration || 0);
        } catch {
          // ignore seek errors and use the first available frame
        }

        return video;
      }

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = `${url}${url.includes('?') ? '&' : '?'}canvas=true`;
      await image.decode();
      return image;
    }

    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const CANVAS_WIDTH = 1200;
      const CANVAS_HEIGHT = 628;
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/assets/logos/uwufufu-logo-rgb.svg';

      let startTime: number | null = null;
      let animFrame: number;
      titleRef.current = '';
      charIndexRef.current = 0;
      const fullTitle = worldcup.title;
      const creatorName = worldcup.user?.name || '';

      // All times in ms (based on 60fps reference)
      const durationMs = 1000; // image scale animation
      const vsDelayMs = 1000;
      const vsDurationMs = 500;
      const imageStartMs = 1500;
      const vsStartMs = imageStartMs + vsDelayMs;
      const fadeStartMs = vsStartMs + vsDurationMs;
      const fadeDurationMs = 1000;
      const totalDurationMs = fadeStartMs + fadeDurationMs + 1000;

      let mediaA: CanvasMediaSource | null = null;
      let mediaB: CanvasMediaSource | null = null;

      const draw = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3e3e3e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const topY = 40;
        const margin = 40;
        const centerY = CANVAS_HEIGHT / 2;
        const finalWidth = CANVAS_WIDTH / 2 - margin * 2;
        const finalHeight = CANVAS_HEIGHT - 40 - margin * 2;

        const t = Math.min((elapsed - imageStartMs) / durationMs, 1);
        const easeInStrong = Math.pow(Math.max(t, 0), 5);
        const overshoot = t < 1 ? 1.08 + 0.08 * (1 - t) : 1;
        const scale = easeInStrong * overshoot;
        const yStretch = t > 0.8 ? 1 + (1 - t) * 0.15 : 1;

        const drawWidth = finalWidth * scale;
        const drawHeight = finalHeight * scale * yStretch;
        const offsetY = (canvas.height - drawHeight) / 2;

        const xA = margin + (finalWidth - drawWidth) / 2;
        const xB = canvas.width / 2 + margin + (finalWidth - drawWidth) / 2;

        // 🔴 Winner aura BEHIND image
        if (elapsed >= fadeStartMs) {
          const auraProgress = Math.min(
            (elapsed - fadeStartMs) / fadeDurationMs,
            1
          );
          ctx.save();
          ctx.shadowColor = '#e73929';
          ctx.shadowBlur = 60 * auraProgress;
          ctx.globalAlpha = 0.4 + 0.6 * auraProgress;
          if (finalWinnerId === finalStartedGame!.match.selection1.id) {
            drawImageCover(ctx, mediaA!, xA, offsetY, drawWidth, drawHeight);
          } else {
            drawImageCover(ctx, mediaB!, xB, offsetY, drawWidth, drawHeight);
          }
          ctx.restore();
        }

        // 🖼️ Draw both images using cover logic
        if (elapsed >= imageStartMs) {
          ctx.save();
          drawImageCover(ctx, mediaA!, xA, offsetY, drawWidth, drawHeight);
          drawImageCover(ctx, mediaB!, xB, offsetY, drawWidth, drawHeight);
          ctx.restore();
        }

        // 🕶️ Loser fade BEFORE VS text
        if (elapsed >= fadeStartMs) {
          const fadeProgress = Math.min(
            (elapsed - fadeStartMs) / fadeDurationMs,
            1
          );
          const loserAlpha = 0.65 * fadeProgress;

          ctx.save();
          ctx.globalAlpha = loserAlpha;
          ctx.fillStyle = 'black';

          const loserIsA =
            finalWinnerId === finalStartedGame!.match.selection2.id;
          const loserIsB =
            finalWinnerId === finalStartedGame!.match.selection1.id;

          if (loserIsA) ctx.fillRect(xA, offsetY, drawWidth, drawHeight);
          else if (loserIsB) ctx.fillRect(xB, offsetY, drawWidth, drawHeight);

          ctx.restore();
        }

        // 🔠 VS text
        if (elapsed >= vsStartMs) {
          const vsProgress = Math.min((elapsed - vsStartMs) / vsDurationMs, 1);
          const vsScale = 0.8 + 0.7 * Math.sin(vsProgress * Math.PI);
          const vsAlpha = vsProgress;

          ctx.save();
          ctx.globalAlpha = vsAlpha;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(vsScale, vsScale);
          ctx.font = 'bold 100px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineWidth = 8;
          ctx.strokeStyle = 'black';
          ctx.strokeText('VS', 0, 0);
          ctx.fillStyle = '#FF4444';
          ctx.fillText('VS', 0, 0);
          ctx.restore();
        }

        // 📝 Title typing (within 1 second)
        const typingInterval = 1000 / fullTitle.length;
        while (
          charIndexRef.current < fullTitle.length &&
          elapsed >= charIndexRef.current * typingInterval
        ) {
          titleRef.current += fullTitle[charIndexRef.current];
          charIndexRef.current++;
        }

        // ⬆️ Title movement
        const moveStart = 1000;
        const moveEnd = 1500;
        let titleY = centerY;
        if (elapsed >= moveStart && elapsed < moveEnd) {
          const moveProgress = (elapsed - moveStart) / (moveEnd - moveStart);
          titleY = centerY - (centerY - topY) * moveProgress;
        } else if (elapsed >= moveEnd) {
          titleY = topY;
        }

        // 🖋️ Draw title
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.font = 'bold 32px Arial';
        const textWidth = ctx.measureText(fullTitle).width;
        ctx.font =
          textWidth < canvas.width * 0.7
            ? 'bold 40px Arial'
            : 'bold 32px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        const words = titleRef.current.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          const width = ctx.measureText(testLine).width;
          if (width < canvas.width * 0.8) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = 40;
        lines.forEach((line, i) => {
          ctx.fillText(line, canvas.width / 2, titleY + i * lineHeight);
        });
        ctx.restore();

        // 👤 Creator credit
        if (creatorName) {
          ctx.save();
          ctx.font = '32px Arial';
          ctx.fillStyle = '#AAAAAA';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`Big thanks to ${creatorName}`, 20, canvas.height - 8);
          ctx.restore();
        }

        // 🐾 uwufufu logo
        const logoAspectRatio = 0.145;
        const logoWidth = canvas.width * 0.2;
        const logoHeight = logoWidth * logoAspectRatio;
        const padding = 12;

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(
          logoImg,
          canvas.width - logoWidth - padding,
          canvas.height - logoHeight - padding,
          logoWidth,
          logoHeight
        );
        ctx.restore();

        if (elapsed === 0 && onAnimationStart) onAnimationStart();
        if (elapsed < totalDurationMs) {
          animFrame = requestAnimationFrame(draw);
        } else {
          if (onAnimationEnd) onAnimationEnd();
        }
      };

      const start = async () => {
        try {
          [mediaA, mediaB] = await Promise.all([
            loadCanvasSource(finalStartedGame!.match.selection1.resourceUrl, {
              isVideo: finalStartedGame!.match.selection1.isVideo,
              videoSource: finalStartedGame!.match.selection1.videoSource,
            }),
            loadCanvasSource(finalStartedGame!.match.selection2.resourceUrl, {
              isVideo: finalStartedGame!.match.selection2.isVideo,
              videoSource: finalStartedGame!.match.selection2.videoSource,
            }),
          ]);

          await logoImg.decode();
          requestAnimationFrame(draw);
        } catch (err) {
          console.error('Canvas media decode failed', err);
          onAnimationEnd?.();
        }
      };

      start();

      return () => {
        cancelAnimationFrame(animFrame);

        [mediaA, mediaB].forEach((media) => {
          if (media instanceof HTMLVideoElement) {
            media.pause();
            media.removeAttribute('src');
            media.load();
          }
        });
      };
    }, [
      onAnimationStart,
      onAnimationEnd,
      worldcup.title,
      worldcup.user?.name,
      finalWinnerId,
      finalStartedGame,
    ]);

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <canvas
          ref={canvasRef}
          style={{
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            zIndex: 1,
            position: 'relative',
          }}
        />
      </div>
    );
  }
);

Animation1Canvas.displayName = 'Animation1Canvas';

export default Animation1Canvas;
