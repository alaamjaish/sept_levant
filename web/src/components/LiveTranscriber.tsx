"use client";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type Props = {
  lang?: string; // e.g., 'ar' or 'ar-EG'
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onStatus?: (status: "idle" | "connecting" | "listening" | "unsupported" | "error") => void;
};

export type LiveTranscriberHandle = {
  start: () => Promise<boolean>;
  stop: () => void;
  reset: () => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

const LiveTranscriber = forwardRef<LiveTranscriberHandle, Props>(
  ({ lang = "ar", onPartial, onFinal, onStatus }, ref) => {
    const recognitionRef = useRef<any>(null);
    const [supported, setSupported] = useState<boolean>(true);
    const shouldRestartRef = useRef(false);

    useEffect(() => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        setSupported(false);
        onStatus?.("unsupported");
        return;
      }
      const r = new SR();
      r.lang = lang;
      r.continuous = true;
      r.interimResults = true;

      r.onstart = () => onStatus?.("listening");
      r.onerror = () => onStatus?.("error");
      r.onend = () => {
        // Chrome sometimes ends; restart if still recording
        if (shouldRestartRef.current) {
          try { r.start(); } catch {}
        } else {
          onStatus?.("idle");
        }
      };
      r.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const res = e.results[i];
          const txt = res[0]?.transcript || "";
          if (res.isFinal) onFinal?.(txt.trim());
          else interim += txt;
        }
        if (interim) onPartial?.(interim.trim());
      };

      recognitionRef.current = r;

      return () => {
        // Ensure we fully stop on unmount
        shouldRestartRef.current = false;
        try { r.stop(); } catch {}
        try { r.abort?.(); } catch {}
        onStatus?.("idle");
      };
    }, [lang, onFinal, onPartial, onStatus]);

    useImperativeHandle(ref, () => ({
      start: async () => {
        if (!recognitionRef.current) {
          onStatus?.("unsupported");
          return false;
        }
        try {
          onStatus?.("connecting");
          shouldRestartRef.current = true;
          recognitionRef.current.start();
          return true;
        } catch {
          onStatus?.("error");
          return false;
        }
      },
      stop: () => {
        // Hard stop and do not auto-restart
        shouldRestartRef.current = false;
        try { recognitionRef.current?.abort?.(); } catch {}
        try { recognitionRef.current?.stop?.(); } catch {}
        onStatus?.("idle");
        onPartial?.("");
      },
      reset: () => {
        onPartial?.("");
      },
    }));

    return null; // headless controller; UI handled by parent
  }
);

LiveTranscriber.displayName = "LiveTranscriber";
export default LiveTranscriber;
