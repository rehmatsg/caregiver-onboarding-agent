'use client';

import { useEffect, useRef } from 'react';
import { Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineWaveformProps {
  audioData: Uint8Array | null;
  duration: number;
  onStop: () => void;
}

export function InlineWaveform({ audioData, duration, onStop }: InlineWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const bufferLength = audioData.length;
    const sliceWidth = width / bufferLength;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#3b82f6'); // blue-500
    gradient.addColorStop(0.5, '#8b5cf6'); // purple-500
    gradient.addColorStop(1, '#ec4899'); // pink-500
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = audioData[i] / 128.0; // normalize to 0-2 range
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [audioData]);

  return (
    <div className="flex w-full items-center gap-3 rounded-full bg-linear-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-300 dark:border-gray-600 px-5 py-2.5 animate-in zoom-in-95 duration-200 shadow-sm">
      <div className="relative flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
      </div>

      <canvas
        ref={canvasRef}
        className="h-10 flex-1"
        style={{ height: '40px' }}
      />

      <span className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300 shrink-0 min-w-12">
        {formatDuration(duration)}
      </span>

      <Button
        type="button"
        size="icon"
        onClick={onStop}
        className="h-9 w-9 shrink-0 rounded-full bg-red-500 hover:bg-red-600 shadow-md"
      >
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
}

