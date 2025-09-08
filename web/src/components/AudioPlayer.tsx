"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Src = string | Blob | null | undefined;

type Props = {
  src: Src;
  title?: string;
  disabled?: boolean;
  className?: string;
  onPlayRequest?: () => Promise<void> | void;
};

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src, title, disabled, className, onPlayRequest }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);

  // Create object URL for Blob and cleanup
  const srcUrl = useMemo(() => {
    if (!src) return "";
    if (typeof src === "string") return src;
    const url = URL.createObjectURL(src);
    return url;
  }, [src]);

  // Cleanup blob URL on unmount or change
  useEffect(() => {
    return () => {
      if (src && typeof src !== "string") {
        try { URL.revokeObjectURL(srcUrl); } catch {}
      }
    };
  }, [src, srcUrl]);

  // Load metadata
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => {
      setDuration(el.duration || 0);
      setReady(true);
    };
    const onEnded = () => setPlaying(false);
    const onTime = () => setCurrent(el.currentTime || 0);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onTime);
    };
  }, [srcUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = rate;
  }, [rate]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el || !srcUrl || disabled) return;
    if (!playing) {
      try { await onPlayRequest?.(); } catch {}
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const seekTo = (time: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(duration || 0, time));
  };

  return (
    <div className={`w-full rounded-xl ring-1 ring-slate-200 bg-white/80 p-3 ${className || ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-slate-700 truncate">{title || "Audio"}</div>
        <div className="text-xs text-slate-500">{formatTime(current)} / {formatTime(duration)}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={disabled || !srcUrl}
          onClick={togglePlay}
          className={`px-3 py-2 rounded-lg text-white ${playing ? "bg-rose-600 hover:bg-rose-500" : "bg-slate-900 hover:bg-slate-800"} disabled:opacity-40`}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          disabled={disabled || !ready}
          onClick={() => seekTo(current - 10)}
          className="px-2 py-2 rounded ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
          title="Back 10s"
        >-10s</button>
        <button
          disabled={disabled || !ready}
          onClick={() => seekTo(current + 10)}
          className="px-2 py-2 rounded ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
          title="Forward 10s"
        >+10s</button>
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={0.01}
          value={Math.min(current, duration)}
          onChange={(e) => seekTo(parseFloat(e.target.value))}
          className="flex-1 h-2 accent-indigo-600"
          disabled={disabled || !ready}
        />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-2 accent-indigo-600"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Speed</span>
          <select
            className="text-sm border border-slate-300 rounded px-2 py-1 bg-white"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            disabled={disabled}
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>
      </div>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={srcUrl} preload="metadata" />
    </div>
  );
}

