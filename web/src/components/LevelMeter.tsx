"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
  height?: number;
  bars?: number;
  className?: string;
};

// Simple vertical bars meter using WebAudio analyser
export default function LevelMeter({ stream, height = 36, bars = 24, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    ctxRef.current = audioCtx;
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const c = canvas.getContext("2d")!;
    let running = true;

    const draw = () => {
      if (!running) return;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const barWidth = width / bars;
      const barGap = Math.max(1, Math.floor(barWidth * 0.15));
      const innerBar = barWidth - barGap;
      c.clearRect(0, 0, width, canvas.height);

      for (let i = 0; i < bars; i++) {
        const idx = Math.floor((i / bars) * bufferLength);
        const value = dataArray[idx] / 255; // 0..1
        const h = Math.max(2, value * (canvas.height - 2));
        const x = i * barWidth + barGap / 2;
        const y = canvas.height - h;
        // gradient bar
        const grad = c.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, "#22d3ee"); // cyan-400
        grad.addColorStop(1, "#6366f1"); // indigo-500
        c.fillStyle = grad;
        c.fillRect(x, y, innerBar, h);
        c.globalAlpha = 0.15;
        c.fillStyle = "#0f172a"; // slate-900 shadow
        c.fillRect(x, y + h - 2, innerBar, 2);
        c.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(height * dpr);
      c.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      try { audioCtx.close(); } catch {}
      ctxRef.current = null;
      analyserRef.current = null;
    };
  }, [stream, height, bars]);

  return (
    <div className={className} style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full rounded-md" />
    </div>
  );
}

