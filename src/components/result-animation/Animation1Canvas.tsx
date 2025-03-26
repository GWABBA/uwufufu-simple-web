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

    function drawImageCover(
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      dx: number,
      dy: number,
      dWidth: number,
      dHeight: number
    ) {
      const imgAspect = img.width / img.height;
      const boxAspect = dWidth / dHeight;

      let sx = 0,
        sy = 0,
        sWidth = img.width,
        sHeight = img.height;

      if (imgAspect > boxAspect) {
        // Image is wider, crop sides
        sWidth = img.height * boxAspect;
        sx = (img.width - sWidth) / 2;
      } else {
        // Image is taller, crop top/bottom
        sHeight = img.width / boxAspect;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }

    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = 600;
      canvas.height = 400;

      const imgA = new Image();
      const imgB = new Image();
      imgA.crossOrigin = 'anonymous';
      imgB.crossOrigin = 'anonymous';
      imgA.src = `${
        finalStartedGame!.match.selection1.resourceUrl
      }?canvas=true`;
      imgB.src = `${
        finalStartedGame!.match.selection2.resourceUrl
      }?canvas=true`;
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/assets/logos/uwufufu-logo-rgb.svg';

      let frame = 0;
      let animFrame: number;
      titleRef.current = '';
      charIndexRef.current = 0;
      const fullTitle = worldcup.title;
      const creatorName = worldcup.user?.name || '';

      const duration = 60;
      const vsDelay = 60;
      const vsDuration = 30;

      const imageStartFrame = 90;
      const vsStartFrame = imageStartFrame + vsDelay;
      const fadeStart = vsStartFrame + vsDuration;
      const fadeDuration = 60;
      const totalFrames = fadeStart + fadeDuration + 60;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3e3e3e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const topY = 30;
        const margin = 10;

        const finalWidth = canvas.width / 2 - margin * 2;
        const finalHeight = canvas.height - 40 - margin * 2;

        const t = Math.min((frame - imageStartFrame) / duration, 1);
        const easeInStrong = Math.pow(t, 5);
        const overshoot = t < 1 ? 1.08 + 0.08 * (1 - t) : 1;
        const scale = easeInStrong * overshoot;
        const yStretch = t > 0.8 ? 1 + (1 - t) * 0.15 : 1;

        const drawWidth = finalWidth * scale;
        const drawHeight = finalHeight * scale * yStretch;
        const offsetY = (canvas.height - drawHeight) / 2;

        const xA = margin + (finalWidth - drawWidth) / 2;
        const xB = canvas.width / 2 + margin + (finalWidth - drawWidth) / 2;

        // 🔴 Winner aura BEHIND image
        if (frame >= fadeStart) {
          const auraProgress = Math.min((frame - fadeStart) / fadeDuration, 1);

          ctx.save();
          ctx.shadowColor = '#e73929';
          ctx.shadowBlur = 60 * auraProgress;
          ctx.globalAlpha = 0.4 + 0.6 * auraProgress;

          if (finalWinnerId === finalStartedGame!.match.selection1.id) {
            drawImageCover(ctx, imgA, xA, offsetY, drawWidth, drawHeight);
          } else {
            drawImageCover(ctx, imgB, xB, offsetY, drawWidth, drawHeight);
          }

          ctx.restore();
        }

        // 🖼️ Draw both images using cover logic
        if (frame >= imageStartFrame) {
          ctx.save();
          drawImageCover(ctx, imgA, xA, offsetY, drawWidth, drawHeight);
          drawImageCover(ctx, imgB, xB, offsetY, drawWidth, drawHeight);
          ctx.restore();
        }

        // 🕶️ Loser fade BEFORE VS text
        if (frame >= fadeStart) {
          const fadeProgress = Math.min((frame - fadeStart) / fadeDuration, 1);
          const loserAlpha = 0.65 * fadeProgress;

          ctx.save();
          ctx.globalAlpha = loserAlpha;
          ctx.fillStyle = 'black';

          const loserIsA =
            finalWinnerId === finalStartedGame!.match.selection2.id;
          const loserIsB =
            finalWinnerId === finalStartedGame!.match.selection1.id;

          if (loserIsA) {
            ctx.fillRect(xA, offsetY, drawWidth, drawHeight);
          } else if (loserIsB) {
            ctx.fillRect(xB, offsetY, drawWidth, drawHeight);
          }

          ctx.restore();
        }

        // 🔠 VS text
        if (frame >= vsStartFrame) {
          const vsProgress = Math.min((frame - vsStartFrame) / vsDuration, 1);
          const vsScale = 0.8 + 0.7 * Math.sin(vsProgress * Math.PI);
          const vsAlpha = vsProgress;

          ctx.save();
          ctx.globalAlpha = vsAlpha;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(vsScale, vsScale);

          ctx.font = 'bold 72px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineWidth = 8;
          ctx.strokeStyle = 'black';
          ctx.strokeText('VS', 0, 0);
          ctx.fillStyle = '#FF4444';
          ctx.fillText('VS', 0, 0);
          ctx.restore();
        }

        // 📝 Title typing
        if (charIndexRef.current < fullTitle.length && frame < 60) {
          titleRef.current += fullTitle[charIndexRef.current];
          charIndexRef.current++;
        }

        // ⬆️ Title movement
        let titleY = centerY;
        const moveStart = 60;
        const moveEnd = 90;
        if (frame >= moveStart && frame < moveEnd) {
          const moveProgress = (frame - moveStart) / (moveEnd - moveStart);
          titleY = centerY - (centerY - topY) * moveProgress;
        } else if (frame >= moveEnd) {
          titleY = topY;
        }

        // 🖋️ Draw title
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.font = 'bold 32px Arial';
        const textWidth = ctx.measureText(fullTitle).width;
        ctx.font =
          textWidth < canvas.width * 0.7
            ? 'bold 32px Arial'
            : 'bold 24px Arial';
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

        const lineHeight = 30;
        lines.forEach((line, i) => {
          ctx.fillText(line, canvas.width / 2, titleY + i * lineHeight);
        });
        ctx.restore();

        // 👤 Creator credit
        if (creatorName) {
          ctx.save();
          ctx.font = '16px Arial';
          ctx.fillStyle = '#AAAAAA';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`Big thanks to ${creatorName}`, 20, canvas.height - 8);
          ctx.restore();
        }

        frame++;
        if (frame === 1 && onAnimationStart) onAnimationStart();
        if (frame === totalFrames && onAnimationEnd) onAnimationEnd();
        if (frame < totalFrames) {
          animFrame = requestAnimationFrame(draw);
        }

        // 🐾 Draw uwufufu logo (bottom right)
        const logoAspectRatio = 0.145;
        const logoWidth = canvas.width * 0.18;
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
      };

      const start = async () => {
        try {
          await Promise.all([imgA.decode(), imgB.decode(), logoImg.decode()]);
          requestAnimationFrame(draw);
        } catch (err) {
          console.error('Image decode failed', err);
        }
      };

      start();

      return () => cancelAnimationFrame(animFrame);
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
