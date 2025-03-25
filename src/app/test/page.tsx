'use client';

import { useRef } from 'react';
import Animation1Canvas, {
  Animation1CanvasHandle,
} from '@/components/result-animation/Animation1Canvas';

export default function VsTestPage() {
  const canvasRef = useRef<Animation1CanvasHandle>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleStartRecording = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;

    const stream = canvas.captureStream(60); // Match FPS

    if (!stream || !stream.getTracks().length) {
      console.error('Canvas stream is empty');
      return;
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (chunks.length === 0) {
        console.error('No data recorded');
        return;
      }

      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'vs-animation.webm';
      a.click();

      URL.revokeObjectURL(url);
    };

    recorder.start();

    recorderRef.current = recorder;
    chunksRef.current = chunks;
  };

  const handleStopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-gray-100">
      <h1 className="text-2xl font-bold">VS Animation Test</h1>

      <Animation1Canvas
        ref={canvasRef}
        imageA="https://cdn.uwufufu.com/selection/1742833065243-HOUSE.jpg"
        imageB="https://cdn.uwufufu.com/selection/1742833074993-SQUALO.jpg"
        onAnimationStart={handleStartRecording}
        onAnimationEnd={handleStopRecording}
      />
    </div>
  );
}
