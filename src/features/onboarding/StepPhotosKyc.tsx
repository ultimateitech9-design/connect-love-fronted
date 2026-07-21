"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, Loader2, ShieldCheck, Video } from "lucide-react";

import { PhotoGrid } from "@/features/user/PhotoGrid";
import { getToken } from "@/lib/auth";

type PhotoProfile = {
  photos?: string[];
  kycLivePhoto?: string;
  kycMatched?: boolean;
};

type MatchResult = {
  matched: boolean;
  score: number;
  kycLivePhoto?: string;
  motionDetected?: boolean;
};

const MATCH_THRESHOLD = 60;
const RECORD_SECONDS = 7;
const MAX_KYC_FRAMES = 5;
const API = API_ORIGIN;

export function StepProfilePhotos({
  profile,
  onNext,
}: {
  profile: PhotoProfile;
  onNext: (value: { photos: string[] }) => void;
}) {
  const [photos, setPhotos] = useState<string[]>(profile.photos || []);
  const [message, setMessage] = useState("");

  const handleContinue = () => {
    if (!photos.length) {
      setMessage("Add at least one photo before video KYC.");
      return;
    }
    onNext({ photos });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Profile photos</p>
          <p className="mt-1 text-xs text-slate-400">Add 1 photo minimum. You can add up to 5.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${photos.length ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
          {photos.length}/5
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white p-4">
        <PhotoGrid
          photos={photos}
          onPhotosChange={(newPhotos) => {
            setPhotos(newPhotos);
            setMessage("");
          }}
        />
      </div>

      {message && <p className="text-sm text-rose-300">{message}</p>}

      <button
        type="button"
        disabled={!photos.length}
        onClick={handleContinue}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-3 font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        Continue to video KYC
      </button>
    </div>
  );
}

export function StepVideoKyc({
  profile,
  onNext,
}: {
  profile: PhotoProfile;
  onNext: (value: Record<string, never>) => void | Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [kycFrame, setKycFrame] = useState(profile.kycLivePhoto || "");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(
    profile.kycMatched ? { matched: true, score: 100 } : null,
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [checking, setChecking] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [countdown, setCountdown] = useState(RECORD_SECONDS);
  const [message, setMessage] = useState("");
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    const supported = window.isSecureContext && Boolean(navigator.mediaDevices?.getUserMedia);
    setCameraSupported(supported);
    if (!supported) {
      setMessage("Camera requires a secure HTTPS connection. Open this website with https:// and try again.");
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startCamera = async () => {
    setMessage("");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
      setMessage("Camera is blocked because this page is not secure. Use the HTTPS version of this website.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 900 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (error) {
      const cameraError = error as DOMException;
      if (cameraError.name === "NotAllowedError") {
        setMessage("Camera access was blocked. Allow Camera in the browser site settings, then try again.");
      } else if (cameraError.name === "NotFoundError") {
        setMessage("No camera was found on this device.");
      } else if (cameraError.name === "NotReadableError") {
        setMessage("The camera is already in use by another app. Close it and try again.");
      } else {
        setMessage("Camera could not start. Check browser camera permissions and try again.");
      }
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return "";

    canvas.width = 720;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (videoRatio > canvasRatio) {
      sourceWidth = video.videoHeight * canvasRatio;
      sourceX = (video.videoWidth - sourceWidth) / 2;
    } else {
      sourceHeight = video.videoWidth / canvasRatio;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  const startVideoKyc = () => {
    if (!profile.photos?.length) {
      setMessage("Upload one profile photo before video KYC.");
      return;
    }
    if (!cameraReady) {
      setMessage("Start camera first.");
      return;
    }

    setCountdown(RECORD_SECONDS);
    setRecording(true);
    setMessage("");
    setMatchResult(null);

    let secondsLeft = RECORD_SECONDS;
    const capturedFrames: string[] = [];
    timerRef.current = window.setInterval(async () => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);

      // Let auto-focus/exposure settle for the first two seconds, then collect
      // five distinct samples accepted by the verification API.
      if (secondsLeft > 0 && secondsLeft <= MAX_KYC_FRAMES) {
        const sampledFrame = captureFrame();
        if (sampledFrame) capturedFrames.push(sampledFrame);
      }

      if (secondsLeft <= 0) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setRecording(false);
        setChecking(true);

        if (!capturedFrames.length) {
          setMessage("Could not capture video frame. Please try again.");
          setChecking(false);
          return;
        }

        try {
          const response = await fetch(`${API}/kyc/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ liveFrames: capturedFrames }),
          });
          const result = await response.json().catch(() => null);
          if (!response.ok) {
            const detail = Array.isArray(result?.message) ? result.message.join(" ") : result?.message;
            throw new Error(detail || "Face verification could not be completed.");
          }
          setKycFrame(result.kycLivePhoto || capturedFrames[0]);
          setMatchResult(result);
          if (result.matched) {
            setMessage("Verification complete. Opening your dashboard...");
            await onNext({});
          } else {
            setMessage(
              result.motionDetected === false
                ? "Please keep your face visible and slowly turn your head during verification."
                : `Match score ${result.score}%. The live face must match your uploaded photos by at least ${MATCH_THRESHOLD}%.`,
            );
          }
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Could not verify video KYC. Please try again.");
        } finally {
          setChecking(false);
        }
      }
    }, 1000);
  };

  const canFinish = Boolean(kycFrame) && matchResult?.matched;

  const skipKyc = async () => {
    if (recording || checking || skipping) return;
    setSkipping(true);
    setMessage("");
    streamRef.current?.getTracks().forEach((track) => track.stop());
    try {
      await onNext({});
    } catch {
      setMessage("Could not open the dashboard. Please try again.");
    } finally {
      setSkipping(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-[280px] w-full bg-slate-950 object-cover sm:h-[320px] lg:h-[360px]"
          />
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <div>
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-rose-400" />
              <p className="font-semibold">Video KYC match</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Record a 7-second live video. Keep your face visible and slowly turn your head; valid frames are compared with your profile photos.
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-300">Required match: {MATCH_THRESHOLD}% or higher</p>
            <p className="mt-2 text-xs text-slate-500">Optional — you can skip this step and verify later.</p>

            {recording && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200">
                Recording video KYC... {countdown}s
              </div>
            )}

            {matchResult && (
              <div className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                matchResult.matched
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}>
                {matchResult.matched ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                Match score {matchResult.score}%
              </div>
            )}

            {message && (
              <p className={`mt-3 text-sm ${matchResult?.matched ? "text-emerald-300" : "text-rose-300"}`}>
                {message}
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={startCamera}
              disabled={!cameraSupported}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {cameraReady ? "Camera ready" : "Start camera"}
            </button>
            <button
              type="button"
              onClick={startVideoKyc}
              disabled={!cameraSupported || recording || checking || !profile.photos?.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
              {checking ? "Checking..." : "Record video KYC"}
            </button>
          </div>
        </div>
      </div>

      {kycFrame && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
          <img src={kycFrame} alt="Video KYC capture" className="h-14 w-12 rounded-lg object-cover" />
          <div>
            <p className="text-sm font-semibold text-white">Video frame captured</p>
            <p className="text-xs text-slate-400">This frame is matched against your first profile photo.</p>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!canFinish}
        onClick={() => onNext({})}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        Enter dashboard
      </button>

      <button
        type="button"
        onClick={skipKyc}
        disabled={recording || checking || skipping}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {skipping && <Loader2 className="h-4 w-4 animate-spin" />}
        {skipping ? "Opening dashboard..." : "Skip for now"}
      </button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
