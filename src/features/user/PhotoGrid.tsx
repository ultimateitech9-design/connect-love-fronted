import React, { useRef, useState } from "react";
import { Reorder } from "framer-motion";
import {
  Camera,
  Contrast,
  FlipHorizontal,
  MoveHorizontal,
  MoveVertical,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
  Star,
  Sun,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";

interface PhotoGridProps {
  photos: string[];
  onPhotosChange: (newPhotos: string[]) => void;
  disabled?: boolean;
}

type EditorState = {
  source: string;
  fileName: string;
};

export function PhotoGrid({ photos, onPhotosChange, disabled }: PhotoGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);

  const resetEditorTools = () => {
    setZoom(1);
    setRotation(0);
    setFlipped(false);
    setBrightness(100);
    setContrast(100);
    setCropX(0);
    setCropY(0);
  };

  const openEditor = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const source = event.target?.result;
      if (typeof source !== "string") return;
      resetEditorTools();
      setEditor({ source, fileName: file.name });
    };
    reader.onerror = () => alert("Could not read this photo.");
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 5) {
      alert("Maximum 5 photos allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    openEditor(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderEditedImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!editor) return reject(new Error("No photo selected."));

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const outputWidth = 900;
        const outputHeight = 1200;
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas is not available."));

        const normalizedRotation = ((rotation % 360) + 360) % 360;
        const quarterTurn = normalizedRotation === 90 || normalizedRotation === 270;
        const coverWidth = quarterTurn ? img.height : img.width;
        const coverHeight = quarterTurn ? img.width : img.height;
        const scale = Math.max(outputWidth / coverWidth, outputHeight / coverHeight) * zoom;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outputWidth, outputHeight);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.translate(outputWidth / 2, outputHeight / 2);
        ctx.rotate((normalizedRotation * Math.PI) / 180);
        ctx.scale(flipped ? -1 : 1, 1);
        ctx.translate((cropX / 100) * outputWidth, (cropY / 100) * outputHeight);
        ctx.drawImage(
          img,
          -(img.width * scale) / 2,
          -(img.height * scale) / 2,
          img.width * scale,
          img.height * scale,
        );

        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = () => reject(new Error("Could not load this photo."));
      img.src = editor.source;
    });
  };

  const saveEditedPhoto = async () => {
    if (!editor) return;

    setUploading(true);
    try {
      const editedPhoto = await renderEditedImage();
      if (photos.includes(editedPhoto)) {
        alert("This photo is already uploaded.");
        return;
      }
      onPhotosChange([...photos, editedPhoto]);
      setEditor(null);
      resetEditorTools();
    } catch (err) {
      console.error(err);
      alert("Could not save this photo. Please try another one.");
    } finally {
      setUploading(false);
    }
  };

  const closeEditor = () => {
    setEditor(null);
    resetEditorTools();
  };

  const uniquePhotos = Array.from(new Set(photos));

  const removePhoto = (index: number) => {
    const newPhotos = [...uniquePhotos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  const makePrimary = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...uniquePhotos];
    const [selected] = newPhotos.splice(index, 1);
    onPhotosChange([selected, ...newPhotos]);
  };

  const handleReorder = (newPhotos: string[]) => {
    onPhotosChange(newPhotos);
  };

  const emptySlotsCount = 5 - uniquePhotos.length;
  const emptySlots = Array.from({ length: emptySlotsCount }).map((_, i) => i + uniquePhotos.length);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid min-w-0 grid-cols-2 gap-2 min-[380px]:gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
        <Reorder.Group
          axis="x"
          values={uniquePhotos}
          onReorder={handleReorder}
          className="contents"
        >
          {uniquePhotos.map((photo, index) => (
            <Reorder.Item
              key={photo}
              value={photo}
              dragListener={!disabled}
              className="relative aspect-[3/4] min-w-0 w-full cursor-grab overflow-hidden rounded-xl border border-rose-100 shadow-md active:cursor-grabbing sm:rounded-2xl"
              style={{ touchAction: "none" }}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                draggable={false}
                className="h-full w-full object-cover"
              />
              <div className="absolute right-1.5 top-1.5 z-10 flex gap-1 sm:right-2 sm:top-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(index)}
                    disabled={disabled}
                    className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-rose-500 shadow-lg transition hover:scale-105 sm:h-7 sm:w-7"
                    title="Make primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  disabled={disabled}
                  className="grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white shadow-lg transition hover:scale-105 sm:h-7 sm:w-7"
                  title={index === 0 ? "Remove profile picture" : "Remove photo"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                  PRIMARY
                </div>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {emptySlots.map((slotIndex) => (
          <div
            key={`empty-${slotIndex}`}
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            className={`relative flex aspect-[3/4] min-w-0 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 transition-colors sm:rounded-2xl ${
              disabled || uploading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-rose-300 hover:bg-rose-50"
            }`}
          >
            {uploading && slotIndex === uniquePhotos.length ? (
              <span className="rounded-full bg-rose-100 p-3 text-rose-500">
                <Camera className="h-6 w-6 animate-pulse" />
              </span>
            ) : (
              <div className="flex flex-col items-center text-rose-400">
                <span className="mb-1.5 rounded-full bg-rose-100 p-1.5 sm:mb-2 sm:p-2">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="text-[10px] font-medium tracking-wide">ADD PHOTO</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 hidden text-center text-xs text-slate-500 min-[380px]:block">
        Drag to reorder. The first photo will be your main profile picture.
      </p>

      {uniquePhotos.length > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => removePhoto(0)}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-500 shadow-sm transition hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove profile picture
          </button>
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="grid max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex min-h-0 items-center justify-center bg-slate-950 p-4 sm:p-6">
              <div className="aspect-[3/4] h-full max-h-[42dvh] overflow-hidden rounded-2xl bg-slate-900 shadow-xl sm:max-h-[56dvh] lg:max-h-[70vh]">
                <img
                  src={editor.source}
                  alt="Photo preview"
                  className="h-full w-full object-cover"
                  style={{
                    transform: `translate(${cropX}%, ${cropY}%) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-1/3 border-t border-white/35" />
                  <div className="absolute inset-x-0 top-2/3 border-t border-white/35" />
                  <div className="absolute inset-y-0 left-1/3 border-l border-white/35" />
                  <div className="absolute inset-y-0 left-2/3 border-l border-white/35" />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit photo</h3>
                  <p className="mt-1 max-w-[22rem] truncate text-xs text-slate-500">{editor.fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-5 pr-1">
                <ToolSlider icon={ZoomIn} label="Zoom" min={1} max={2.2} step={0.05} value={zoom} onChange={setZoom} />
                <ToolSlider icon={MoveHorizontal} label="Crop left / right" min={-35} max={35} step={1} value={cropX} onChange={setCropX} />
                <ToolSlider icon={MoveVertical} label="Crop up / down" min={-35} max={35} step={1} value={cropY} onChange={setCropY} />
                <ToolSlider icon={Sun} label="Brightness" min={70} max={130} step={1} value={brightness} onChange={setBrightness} />
                <ToolSlider icon={Contrast} label="Contrast" min={70} max={140} step={1} value={contrast} onChange={setContrast} />

                <div className="grid grid-cols-3 gap-2">
                  <ToolButton icon={RotateCcw} label="Left" onClick={() => setRotation((r) => r - 90)} />
                  <ToolButton icon={RotateCw} label="Right" onClick={() => setRotation((r) => r + 90)} />
                  <ToolButton icon={FlipHorizontal} label="Flip" active={flipped} onClick={() => setFlipped((v) => !v)} />
                </div>
              </div>

              <div className="sticky bottom-0 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white pt-4">
                <button
                  type="button"
                  onClick={resetEditorTools}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveEditedPhoto}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {uploading ? "Saving..." : "Save photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolSlider({
  icon: Icon,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-slate-100 bg-slate-50 p-3">
      <span className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-slate-500">
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-rose-500" />
          {label}
        </span>
        <span>{Math.round(value * 100) / 100}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-rose-500"
      />
    </label>
  );
}

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
        active
          ? "border-rose-300 bg-rose-50 text-rose-600"
          : "border-slate-100 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
