"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, Loader2, ShieldCheck, Video } from "lucide-react";

import { PhotoGrid } from "@/features/user/PhotoGrid";

type PhotoProfile = {
  photos?: string[];
  kycLivePhoto?: string;
  kycMatched?: boolean;
};

type MatchResult = {
  matched: boolean;
  score: number;
};

type ImageSignature = {
  normalized: number[];
  edges: number[];
  histogram: number[];
};

const MATCH_THRESHOLD = 60;
const RECORD_SECONDS = 3;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = src;
  });
}

async function getImageSignature(src: string): Promise<ImageSignature> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const size = 24;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  let sourceWidth = image.width * 0.68;
  let sourceHeight = image.height * 0.72;
  let sourceX = (image.width - sourceWidth) / 2;
  let sourceY = Math.max(0, (image.height - sourceHeight) * 0.32);

  const Detector = (window as unknown as {
    FaceDetector?: new (options: { fastMode: boolean; maxDetectedFaces: number }) => {
      detect: (source: CanvasImageSource) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  }).FaceDetector;

  if (Detector) {
    try {
      const faces = await new Detector({ fastMode: true, maxDetectedFaces: 1 }).detect(image);
      const box = faces[0]?.boundingBox;
      if (box) {
        const paddingX = box.width * 0.35;
        const paddingY = box.height * 0.3;
        sourceX = Math.max(0, box.x - paddingX);
        sourceY = Math.max(0, box.y - paddingY);
        sourceWidth = Math.min(image.width - sourceX, box.width + paddingX * 2);
        sourceHeight = Math.min(image.height - sourceY, box.height + paddingY * 2);
      }
    } catch {
      // Center crop remains the fallback when browser face detection is unavailable.
    }
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
  const pixels = ctx.getImageData(0, 0, size, size).data;
  const luminance: number[] = [];
  const histogram = Array.from({ length: 12 }, () => 0);

  for (let i = 0; i < pixels.length; i += 4) {
    const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
    luminance.push(gray);
    histogram[Math.min(11, Math.floor(gray / 22))] += 1;
  }

  const mean = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
  const deviation = Math.sqrt(
    luminance.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / luminance.length,
  ) || 1;
  const normalized = luminance.map((value) => (value - mean) / deviation);
  const edges: number[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const index = y * size + x;
      edges.push(normalized[index + 1] - normalized[index]);
    }
  }

  return {
    normalized,
    edges,
    histogram: histogram.map((count) => count / luminance.length),
  };
}

function cosineSimilarity(left: number[], right: number[]): number {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let i = 0; i < left.length; i += 1) {
    dot += left[i] * right[i];
    leftMagnitude += left[i] * left[i];
    rightMagnitude += right[i] * right[i];
  }

  if (!leftMagnitude || !rightMagnitude) return 0;
  return dot / Math.sqrt(leftMagnitude * rightMagnitude);
}

async function comparePhotos(profilePhoto: string, kycFrame: string): Promise<MatchResult> {
  const [profileSignature, frameSignature] = await Promise.all([
    getImageSignature(profilePhoto),
    getImageSignature(kycFrame),
  ]);

  const structure = ((cosineSimilarity(profileSignature.normalized, frameSignature.normalized) + 1) / 2) * 100;
  const edgeShape = ((cosineSimilarity(profileSignature.edges, frameSignature.edges) + 1) / 2) * 100;
  const tone = profileSignature.histogram.reduce(
    (sum, value, index) => sum + Math.min(value, frameSignature.histogram[index]),
    0,
  ) * 100;
  const rawScore = structure * 0.5 + edgeShape * 0.3 + tone * 0.2;
  const score = Math.max(0, Math.min(98, Math.round(rawScore * 0.9 + 12)));

  return {
    score,
    matched: score >= MATCH_THRESHOLD,
  };
}

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
  onNext: (value: { kycLivePhoto: string; kycMatched: boolean; kycMatchScore: number }) => void;
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
  const [countdown, setCountdown] = useState(RECORD_SECONDS);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startCamera = async () => {
    setMessage("");
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
    } catch {
      setMessage("Camera permission needed for video KYC.");
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
    const profilePhoto = profile.photos?.[0];
    if (!profilePhoto) {
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
      const sampledFrame = captureFrame();
      if (sampledFrame) capturedFrames.push(sampledFrame);
      secondsLeft -= 1;
      setCountdown(secondsLeft);

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
          const results = await Promise.all(
            capturedFrames.map(async (frame) => ({ frame, result: await comparePhotos(profilePhoto, frame) })),
          );
          const best = results.reduce((current, candidate) => (
            candidate.result.score > current.result.score ? candidate : current
          ));
          setKycFrame(best.frame);
          setMatchResult(best.result);
          if (!best.result.matched) {
            setMessage(`Match score ${best.result.score}%. Face the camera in even light and try again.`);
          }
        } catch {
          setMessage("Could not compare video KYC with your profile photo. Please try again.");
        } finally {
          setChecking(false);
        }
      }
    }, 1000);
  };

  const canFinish = Boolean(kycFrame) && matchResult?.matched;

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
              Record a short live video. We compare a video frame with your first profile photo.
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-300">Required match: {MATCH_THRESHOLD}% or higher</p>

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

            {message && <p className="mt-3 text-sm text-rose-300">{message}</p>}
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              <Camera className="h-4 w-4" />
              {cameraReady ? "Camera ready" : "Start camera"}
            </button>
            <button
              type="button"
              onClick={startVideoKyc}
              disabled={recording || checking || !profile.photos?.length}
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
        onClick={() => onNext({ kycLivePhoto: kycFrame, kycMatched: true, kycMatchScore: matchResult?.score || 0 })}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        Enter dashboard
      </button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
