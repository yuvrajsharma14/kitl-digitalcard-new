"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Check, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  open:     boolean;
  onClose:  () => void;
  onCapture: (dataUrl: string) => void;
}

type CameraState = "requesting" | "active" | "captured" | "error";

export function CameraCapture({ open, onClose, onCapture }: CameraCaptureProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  const [state, setState]       = useState<CameraState>("requesting");
  const [errorMsg, setErrorMsg] = useState("");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  async function startCamera(mode: "user" | "environment" = facingMode) {
    // Stop any existing stream first
    stopStream();
    setState("requesting");
    setErrorMsg("");
    setSnapshot(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("active");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera unavailable";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setErrorMsg("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setErrorMsg("No camera found on this device.");
      } else {
        setErrorMsg("Could not access camera. Try uploading a photo instead.");
      }
      setState("error");
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function flipCamera() {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  }

  function capturePhoto() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror horizontally for front-facing camera so it matches what you see
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSnapshot(dataUrl);
    setState("captured");
    stopStream();
  }

  function retake() {
    setSnapshot(null);
    startCamera(facingMode);
  }

  function confirm() {
    if (snapshot) {
      onCapture(snapshot);
      handleClose();
    }
  }

  function handleClose() {
    stopStream();
    setState("requesting");
    setSnapshot(null);
    setErrorMsg("");
    onClose();
  }

  useEffect(() => {
    if (open) startCamera(facingMode);
    else       stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-full max-w-lg p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-indigo-600" /> Take a Photo
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black flex items-center justify-center" style={{ minHeight: 300 }}>

          {/* Live video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full max-h-[380px] object-cover ${state === "active" ? "block" : "hidden"}
              ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
          />

          {/* Snapshot preview */}
          {state === "captured" && snapshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={snapshot} alt="Captured" className="w-full max-h-[380px] object-cover" />
          )}

          {/* Requesting / loading */}
          {state === "requesting" && (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              <div className="h-10 w-10 rounded-full border-2 border-gray-600 border-t-white animate-spin" />
              <p className="text-sm">Starting camera…</p>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="flex flex-col items-center gap-3 px-8 py-12 text-center">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="text-sm text-gray-300">{errorMsg}</p>
            </div>
          )}

          {/* Flip button — shown during active capture */}
          {state === "active" && (
            <button
              type="button"
              onClick={flipCamera}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              title="Flip camera"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          {/* Hidden canvas for snapshot */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-white">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="gap-1.5 text-gray-500">
            <X className="h-4 w-4" /> Cancel
          </Button>

          {state === "active" && (
            <button
              type="button"
              onClick={capturePhoto}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors mx-auto"
              title="Capture photo"
            >
              <div className="h-10 w-10 rounded-full border-4 border-white" />
            </button>
          )}

          {state === "captured" && (
            <div className="flex items-center gap-3 mx-auto">
              <Button type="button" variant="outline" size="sm" onClick={retake} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Retake
              </Button>
              <Button type="button" size="sm" onClick={confirm} className="gap-1.5 bg-green-600 hover:bg-green-700">
                <Check className="h-3.5 w-3.5" /> Use this photo
              </Button>
            </div>
          )}

          {state === "error" && (
            <Button type="button" size="sm" onClick={() => startCamera(facingMode)} className="mx-auto gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
