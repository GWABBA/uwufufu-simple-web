'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

type Props = {
  imageA: string;
  imageB: string;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
};

export type Animation1CanvasHandle = {
  getCanvas: () => HTMLCanvasElement | null;
};

const Animation1Canvas = forwardRef<Animation1CanvasHandle, Props>(
  ({ imageA, imageB, onAnimationStart, onAnimationEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = 600;
      canvas.height = 400;

      const imgA = new Image();
      const imgB = new Image();
      imgA.crossOrigin = 'anonymous';
      imgB.crossOrigin = 'anonymous';
      imgA.src = `${imageA}?canvas=true`;
      imgB.src = `${imageB}?canvas=true`;

      let frame = 0;
      let animFrame: number;

      const duration = 60; // Image animation duration
      const vsDelay = 60; // Frame at which VS starts
      const vsDuration = 30; // VS animation duration
      const totalFrames = duration + vsDuration + 30; // Total animation length

      const draw = () => {
        // 🧼 Clear + background
        ctx.fillStyle = '#3e3e3e'; // background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const t = Math.min(frame / duration, 1);
        const easeInStrong = Math.pow(t, 5);
        const overshoot = t < 1 ? 1.08 + 0.08 * (1 - t) : 1;

        // 🧮 Size calculation with margins
        const margin = 10;
        const finalWidth = canvas.width / 2 - margin * 2;
        const finalHeight = canvas.height - 40 - margin * 2;

        const scale = easeInStrong * overshoot;
        const yStretch = t > 0.8 ? 1 + (1 - t) * 0.15 : 1;

        const drawWidth = finalWidth * scale;
        const drawHeight = finalHeight * scale * yStretch;
        const offsetY = (canvas.height - drawHeight) / 2;

        ctx.save();

        // Left (A)
        const xA = margin + (finalWidth - drawWidth) / 2;
        ctx.drawImage(imgA, xA, offsetY, drawWidth, drawHeight);

        // Right (B)
        const xB = canvas.width / 2 + margin + (finalWidth - drawWidth) / 2;
        ctx.drawImage(imgB, xB, offsetY, drawWidth, drawHeight);

        ctx.restore();

        // 🔥 VS text
        if (frame >= vsDelay) {
          const vsProgress = Math.min((frame - vsDelay) / vsDuration, 1);
          const vsScale = 0.8 + 0.7 * Math.sin(vsProgress * Math.PI);
          const vsAlpha = vsProgress;

          ctx.save();
          ctx.globalAlpha = vsAlpha;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(vsScale, vsScale);

          ctx.font = 'bold 72px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Outline
          ctx.lineWidth = 8;
          ctx.strokeStyle = 'black';
          ctx.strokeText('VS', 0, 0);

          // Fill
          ctx.fillStyle = '#FF4444';
          ctx.fillText('VS', 0, 0);

          ctx.restore();
        }

        frame++;

        if (frame === 1 && onAnimationStart) onAnimationStart();
        if (frame === totalFrames && onAnimationEnd) onAnimationEnd();
        if (frame < totalFrames) {
          animFrame = requestAnimationFrame(draw);
        }
      };

      const start = async () => {
        try {
          await Promise.all([imgA.decode(), imgB.decode()]);
          requestAnimationFrame(draw);
        } catch (err) {
          console.error('Image decode failed:', err);
        }
      };

      start();

      return () => cancelAnimationFrame(animFrame);
    }, [imageA, imageB, onAnimationStart, onAnimationEnd]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: '12px',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        }}
      />
    );
  }
);

Animation1Canvas.displayName = 'Animation1Canvas';

export default Animation1Canvas;
