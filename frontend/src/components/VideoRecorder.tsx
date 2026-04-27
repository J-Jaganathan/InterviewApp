"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Backward‑compatible props so callers don’t break */
type Size = "sm" | "md" | "lg";
export interface VideoRecorderProps {
  interviewSessionId: string;
  size?: Size;                 // initial size bucket -> translated into px
  defaultCollapsed?: boolean;  // ignored in controlled mode (always on & visible)
  onReady?: () => void;
  onError?: (e: Error) => void;
  onStopped?: (meta: { durationMs: number }) => void;
}

/* ---------------- constants ---------------- */
const SIZE_TO_PX: Record<Size, { w: number; h: number }> = {
  sm: { w: 220, h: 160 },
  md: { w: 320, h: 240 },
  lg: { w: 420, h: 320 },
};
const MIN_W = 180;
const MIN_H = 120;
const MARGIN = 12;
const HEADER_H = 36;
const LS_KEY = "video_recorder_box_ctrl_v1";

/* ---------------- utilities ---------------- */
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function initialBox(size: Size) {
  const { innerWidth: W, innerHeight: H } =
    typeof window !== "undefined" ? window : { innerWidth: 1280, innerHeight: 800 };
  const { w, h } = SIZE_TO_PX[size] ?? SIZE_TO_PX.sm;
  const x = Math.max(MARGIN, W - w - MARGIN);
  const y = Math.max(MARGIN, H - h - HEADER_H - MARGIN);
  return { w, h, x, y };
}

export default function VideoRecorder({
  interviewSessionId,
  size = "sm",
  // defaultCollapsed ignored in controlled mode
  onReady,
  onError,
  onStopped,
}: VideoRecorderProps) {
  /* ---------- media refs / state ---------- */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTsRef = useRef<number>(0);

  // robust state via refs (no close/minimize in controlled mode)
  type Status = "idle" | "starting" | "live" | "stopping";
  const statusRef = useRef<Status>("idle");
  const startSeqRef = useRef<number>(0);   // cancels in‑flight starts
  const [blocked, setBlocked] = useState<boolean>(false); // true until user grants camera

  /* ---------- UI: draggable + resize-by-drag ---------- */
  const init = initialBox(size);
  const [w, setW] = useState(init.w);
  const [h, setH] = useState(init.h);
  const [x, setX] = useState(init.x);
  const [y, setY] = useState(init.y);

  // persist box
  const persist = () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ w, h, x, y })); } catch {}
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (Number.isFinite(obj.w)) setW(Math.max(MIN_W, obj.w));
      if (Number.isFinite(obj.h)) setH(Math.max(MIN_H, obj.h));
      if (Number.isFinite(obj.x)) setX(obj.x);
      if (Number.isFinite(obj.y)) setY(obj.y);
    } catch {}
  }, []);

  /* ---------- stop media (idempotent) ---------- */
  const stopTracks = useCallback(() => {
    statusRef.current = "stopping";
    try {
      const s = streamRef.current;
      if (s) {
        s.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      }
    } finally {
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      if (startTsRef.current) {
        const durationMs = performance.now() - startTsRef.current;
        startTsRef.current = 0;
        onStopped?.({ durationMs });
      }
      statusRef.current = "idle";
    }
  }, [onStopped]);

  /* ---------- start preview (race‑safe) ---------- */
  const startPreview = useCallback(async () => {
    const token = ++startSeqRef.current;
    if (statusRef.current === "starting" || statusRef.current === "live") return;

    statusRef.current = "starting";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });

      // If a newer start began, discard this stream.
      if (token !== startSeqRef.current) {
        stream.getTracks().forEach((t) => { try { t.stop(); } catch {} });
        statusRef.current = "idle";
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      startTsRef.current = performance.now();
      statusRef.current = "live";
      setBlocked(false);
      onReady?.();

      // Reattach on track end (e.g., device removed / OS kill switch)
      stream.getTracks().forEach((trk) => {
        trk.onended = () => {
          // Only restart if we’re not intentionally stopping (we never are in controlled mode).
          void restartSoon();
        };
      });
    } catch (err) {
      statusRef.current = "idle";
      stopTracks();
      setBlocked(true); // require user to retry/grant
      const e = err instanceof Error ? err : new Error("Camera initialization failed");
      onError?.(e);
    }
  }, [onReady, onError, stopTracks]);

  const restartSoon = useCallback(() => {
    // small debounce to avoid thrash on rapid device changes
    window.setTimeout(() => { void startPreview(); }, 250);
  }, [startPreview]);

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    // auto start on mount / session id change
    void startPreview();

    // page/tab visibility: try to re-attach when becoming visible
    function onVis() { if (document.visibilityState === "visible") void restartSoon(); }
    document.addEventListener("visibilitychange", onVis);

    // periodic watchdog: if video track not live, restart
    const watchdog = window.setInterval(() => {
      const trk = streamRef.current?.getVideoTracks?.()[0];
      const live = trk && trk.readyState === "live";
      if (!live) void startPreview();
    }, 3000);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(watchdog);
      stopTracks(); // free device on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewSessionId]);

  /* ---------- window resize: keep inside viewport ---------- */
  useEffect(() => {
    function keepInside() {
      const maxX = Math.max(0, window.innerWidth - w - MARGIN);
      const maxY = Math.max(0, window.innerHeight - (h + HEADER_H) - MARGIN);
      setX((px) => clamp(px, MARGIN, maxX));
      setY((py) => clamp(py, MARGIN, maxY));
    }
    window.addEventListener("resize", keepInside);
    return () => window.removeEventListener("resize", keepInside);
  }, [w, h]);

  /* ---------- drag move ---------- */
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const onDragStart = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { ox: e.clientX, oy: e.clientY, sx: x, sy: y };
  };
  const onDragMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.ox;
    const dy = e.clientY - dragRef.current.oy;
    const nx = clamp(dragRef.current.sx + dx, MARGIN, Math.max(MARGIN, window.innerWidth - w - MARGIN));
    const ny = clamp(dragRef.current.sy + dy, MARGIN, Math.max(MARGIN, window.innerHeight - (h + HEADER_H) - MARGIN));
    setX(nx); setY(ny);
  };
  const onDragEnd = (e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    dragRef.current = null;
    persist();
  };

  /* ---------- drag resize (bottom-right handle, no icon) ---------- */
  const rsRef = useRef<{ ox: number; oy: number; sw: number; sh: number } | null>(null);
  const onResizeStart = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    rsRef.current = { ox: e.clientX, oy: e.clientY, sw: w, sh: h };
  };
  const onResizeMove = (e: React.PointerEvent) => {
    if (!rsRef.current) return;
    const dw = e.clientX - rsRef.current.ox;
    const dh = e.clientY - rsRef.current.oy;
    const nw = Math.max(MIN_W, rsRef.current.sw + dw);
    const nh = Math.max(MIN_H, rsRef.current.sh + dh);
    const maxW = Math.max(MIN_W, window.innerWidth - x - MARGIN);
    const maxH = Math.max(MIN_H, window.innerHeight - y - HEADER_H - MARGIN);
    setW(Math.min(nw, maxW));
    setH(Math.min(nh, maxH));
  };
  const onResizeEnd = (e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    rsRef.current = null;
    persist();
  };

  /* ---------- render ---------- */
  return (
    <div
      className="fixed z-[9998] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden select-none"
      style={{ left: x, top: y, width: w, userSelect: "none" }}
      role="dialog"
      aria-label="Camera preview (controlled)"
    >
      {/* Header: DRAG HANDLE + LIVE DOT (no buttons in controlled mode) */}
      <div
        className="flex items-center justify-between px-2 py-1 bg-slate-50 border-b border-slate-200 cursor-grab active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
      >
        <div className="flex items-center gap-2 pl-1">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              statusRef.current === "live" ? "bg-red-600" :
              statusRef.current === "starting" ? "bg-amber-500" : "bg-slate-400"
            }`}
          />
          <span className="text-[11px] font-semibold tracking-wide text-slate-700">
            {statusRef.current === "live" ? "LIVE" : statusRef.current === "starting" ? "STARTING" : "OFF"}
          </span>
        </div>
        {/* Right side intentionally empty (no minimize/close/resizer icons) */}
        <div className="w-6 h-4" />
      </div>

      {/* Body */}
      <div className="relative bg-black" style={{ width: w, height: h }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        {/* Invisible resize handle (bottom-right). No icon; just a 10x10 hit area. */}
        <div
          title="Resize"
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          className="absolute right-0.5 bottom-0.5 h-3 w-3 cursor-nwse-resize"
          style={{ background: "transparent" }}
          aria-label="Resize camera window"
        />
        {/* Blocking overlay if permission is missing */}
        {blocked && (
          <div className="absolute inset-0 bg-black/70 text-white flex flex-col items-center justify-center gap-3">
            <div className="text-sm font-semibold">Camera access required</div>
            <button
              onClick={() => { setBlocked(false); void startPreview(); }}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Retry
            </button>
            <div className="text-[11px] text-white/80 px-4 text-center">
              Please grant camera & microphone permission in your browser and click Retry.
            </div>
          </div>
        )}
        {/* Status hint when not fully live */}
        {statusRef.current !== "live" && !blocked && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">
            {statusRef.current === "starting" ? "Initializing camera…" : "Reconnecting…"}
          </div>
        )}
      </div>
    </div>
  );
}