import { useEffect, useRef, useState, useCallback } from "react";
import { Maximize } from "lucide-react";
import { PlayIcon, Cog6ToothIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PauseIcon } from "@heroicons/react/24/solid";
import Hls from "hls.js";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const formatTime = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

interface VideoPlayerProps {
  videoUrl?: string | null;
  posterUrl?: string | null;
  onFirstPlay?: () => void;
}

const VideoPlayer = ({ videoUrl, posterUrl, onFirstPlay }: VideoPlayerProps) => {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const firstPlayFiredRef = useRef(false);
  const wasPlayingRef = useRef(false); // track play state before drag

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [levels, setLevels] = useState<Array<{ index: number; height: number }>>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [qualityOpen, setQualityOpen] = useState(false);

  // ── Scrubbing state ────────────────────────────────────────────────────────
  // While the user is dragging we show scrubPosition instead of current time,
  // but we do NOT seek the video on every drag tick — only on release.
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0); // 0-100

  // ── Controls visibility ───────────────────────────────────────────────────
  const [showControls, setShowControls] = useState(true);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    setShowControls(true);
    clearInactivityTimer();
    if (playing && !isScrubbing) {
      inactivityTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing, isScrubbing, clearInactivityTimer]);

  // Re-evaluate when play state or scrubbing changes
  useEffect(() => {
    if (!playing || isScrubbing) {
      clearInactivityTimer();
      setShowControls(true);
    } else {
      resetInactivityTimer();
    }
    return () => clearInactivityTimer();
  }, [playing, isScrubbing, resetInactivityTimer, clearInactivityTimer]);

  // ── HLS / source setup ────────────────────────────────────────────────────
  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    setPlaying(false);
    setStarted(false);
    setCurrent(0);
    setDuration(0);
    setLevels([]);
    setCurrentLevel(-1);
    setIsScrubbing(false);
    firstPlayFiredRef.current = false;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!videoUrl) {
      v.removeAttribute("src");
      v.load();
      return;
    }

    const isHls = /\.m3u8(\?|$)/i.test(videoUrl);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(v);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const parsed = hls.levels
          .map((l, index) => ({ index, height: l.height ?? 0 }))
          .filter((l) => l.height > 0)
          .sort((a, b) => b.height - a.height);
        setLevels(parsed);
        setCurrentLevel(hls.currentLevel);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        setCurrentLevel(hls.autoLevelEnabled ? -1 : data.level);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        else { hls.destroy(); hlsRef.current = null; }
      });
    } else if (isHls && v.canPlayType("application/vnd.apple.mpeg-url")) {
      v.src = videoUrl;
    } else {
      v.load();
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [videoUrl]);

  // ── Native video event listeners ──────────────────────────────────────────
  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const onTime = () => { if (!isScrubbing) setCurrent(v.currentTime); };
    const onMeta = () => setDuration(v.duration || 0);
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
      if (!firstPlayFiredRef.current) {
        firstPlayFiredRef.current = true;
        onFirstPlay?.();
      }
    };
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setStarted(false); };

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnd);
    };
  }, [onFirstPlay, isScrubbing]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  // Called on every drag tick — only moves the scrub indicator, NOT the video
  const onScrubChange = useCallback((val: number[]) => {
    if (!isScrubbing) {
      setIsScrubbing(true);
      wasPlayingRef.current = !ref.current?.paused;
      ref.current?.pause(); // pause while scrubbing to avoid buffering fights
    }
    setScrubPosition(val[0]);
  }, [isScrubbing]);

  // Called only when user releases the slider — seek happens here once
  const onScrubCommit = useCallback((val: number[]) => {
    const v = ref.current;
    if (v && duration) {
      v.currentTime = (val[0] / 100) * duration;
      setCurrent(v.currentTime);
    }
    setIsScrubbing(false);
    // Resume if video was playing before scrub
    if (wasPlayingRef.current) ref.current?.play();
  }, [duration]);

  const onVol = (val: number[]) => {
    const v = ref.current;
    const nv = val[0] / 100;
    setVolume(nv);
    setMuted(nv === 0);
    if (v) { v.volume = nv; v.muted = nv === 0; }
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    const c = containerRef.current;
    if (!c) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else c.requestFullscreen?.();
  };

  const setQuality = (idx: number) => {
    const hls = hlsRef.current;
    if (hls) { hls.currentLevel = idx; setCurrentLevel(idx); }
    setQualityOpen(false);
  };

  // ── Derived display values ─────────────────────────────────────────────────
  // During a drag we show the scrub position; otherwise show real playback time
  const displayProgress = isScrubbing
    ? scrubPosition
    : duration > 0 ? (current / duration) * 100 : 0;

  const displayTime = isScrubbing
    ? (scrubPosition / 100) * duration
    : current;

  const activeHeight = currentLevel >= 0 ? levels.find((l) => l.index === currentLevel)?.height ?? 0 : 0;
  const qualityLabel = currentLevel === -1 ? "Auto" : `${activeHeight}p`;
  const showQuality = levels.length > 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetInactivityTimer}
      onTouchStart={resetInactivityTimer}
      className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden group btn-glow-soft ${playing && !showControls ? "cursor-none" : ""}`}
    >
      <video
        ref={ref}
        poster={started ? "" : (posterUrl ?? undefined)}
        className="w-full h-full object-contain bg-black"
        onClick={() => { toggle(); resetInactivityTimer(); }}
        playsInline
        controls={false}
        preload="metadata"
      >
        {videoUrl && !/\.m3u8(\?|$)/i.test(videoUrl) ? (
          <source src={videoUrl} type="video/mp4" />
        ) : null}
      </video>

      {!playing && !isScrubbing && (
        <button onClick={toggle} aria-label="Play" className="absolute inset-0 grid place-items-center">
          {!started && posterUrl && (
            <img src={posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <span className="relative z-10 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-gradient-purple grid place-items-center">
            <PlayIcon className="bg-background h-5 w-5 sm:h-7 sm:w-7 md:h-9 md:w-9 text-white fill-white ml-1" />
          </span>
        </button>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-4 transition-opacity duration-300 ${showControls || !playing || isScrubbing ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Progress slider — seek only on commit (mouse/touch release) */}
        <Slider
          value={[displayProgress]}
          onValueChange={onScrubChange}
          onValueCommit={onScrubCommit}
          max={100}
          step={0.1}
          className="mb-2"
        />

        <div className="flex items-center gap-2 sm:gap-3 text-white text-xs sm:text-sm">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            {playing && !isScrubbing
              ? <PauseIcon className="h-5 w-5" />
              : <PlayIcon className="h-5 w-5" />}
          </button>

          <span className="font-mono whitespace-nowrap">
            {formatTime(displayTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button onClick={toggleMute} aria-label="Mute">
              {muted || volume === 0
                ? <SpeakerXMarkIcon className="h-5 w-5" />
                : <SpeakerWaveIcon className="h-5 w-5" />}
            </button>

            <div className="hidden sm:block w-20">
              <Slider
                value={[muted ? 0 : volume * 100]}
                onValueChange={onVol}
                max={100}
                step={1}
              />
            </div>

            {showQuality ? (
              <Popover open={qualityOpen} onOpenChange={setQualityOpen}>
                <PopoverTrigger asChild>
                  <button aria-label="Quality settings" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                    <Cog6ToothIcon className="h-5 w-5" />
                    <span className="hidden sm:inline text-xs font-bold">{qualityLabel}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" sideOffset={8} className="w-36 p-1 bg-card border-border">
                  <button type="button" onClick={() => setQuality(-1)}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm font-bold transition ${currentLevel === -1 ? "bg-gradient-purple text-primary-foreground" : "text-foreground hover:bg-secondary"}`}>
                    <span>Auto</span>
                  </button>
                  {levels.map((l) => (
                    <button key={l.index} type="button" onClick={() => setQuality(l.index)}
                      className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm font-bold transition ${currentLevel === l.index ? "bg-gradient-purple text-primary-foreground" : "text-foreground hover:bg-secondary"}`}>
                      <span>{l.height}p</span>
                      {l.height >= 720 && (
                        <span className="ml-2 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">HD</span>
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              <button aria-label="Settings"><Cog6ToothIcon className="h-5 w-5" /></button>
            )}

            <button onClick={fullscreen} aria-label="Fullscreen">
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;