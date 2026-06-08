import React, { useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { Plus, X, Camera } from "lucide-react";

interface PhotoGridProps {
  photos: string[];
  onPhotosChange: (newPhotos: string[]) => void;
  disabled?: boolean;
}

export function PhotoGrid({ photos, onPhotosChange, disabled }: PhotoGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Resize and compress image using Canvas
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas error");

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85)); // compress to 85% JPEG
        };
        img.onerror = () => reject("Image load error");
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject("File read error");
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 5) {
      alert("Maximum 5 photos allowed.");
      return;
    }

    setUploading(true);
    try {
      const base64 = await processImage(file);
      const newPhotos = [...photos, base64];
      onPhotosChange(newPhotos);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  const handleReorder = (newPhotos: string[]) => {
    onPhotosChange(newPhotos);
  };

  // We need exactly 5 slots. We fill the empty slots with placeholders.
  const emptySlotsCount = 5 - photos.length;
  const emptySlots = Array.from({ length: emptySlotsCount }).map((_, i) => i + photos.length);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        <Reorder.Group
          axis="x" // Actually we'd prefer 2D grid sorting, but framer-motion Reorder works best on 1 axis or requires a custom setup. We can wrap it in a flex to allow wrapping.
          values={photos}
          onReorder={handleReorder}
          className="contents" // "contents" allows children to participate in the grid
        >
          {photos.map((photo, index) => (
            <Reorder.Item
              key={photo} // React key must be unique, photo string works if no duplicates
              value={photo}
              dragListener={!disabled}
              className="relative aspect-[3/4] w-full cursor-grab overflow-hidden rounded-2xl shadow-md active:cursor-grabbing border border-rose-100"
              style={{ touchAction: "none" }}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                draggable={false}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                disabled={disabled}
                className="absolute -top-1 -right-1 z-10 rounded-full bg-rose-500 p-1 text-white shadow-lg transition-transform hover:scale-110 m-2"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm whitespace-nowrap">
                  PRIMARY
                </div>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Empty Slots */}
        {emptySlots.map((slotIndex) => (
          <div
            key={`empty-${slotIndex}`}
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            className={`relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center bg-rose-50/50 transition-colors ${
              disabled || uploading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-rose-50 hover:border-rose-300"
            }`}
          >
            {uploading && slotIndex === photos.length ? (
              <span className="animate-pulse rounded-full bg-rose-100 p-3 text-rose-500">
                 {/* This just shows uploading state on the first empty slot */}
                <Camera className="h-6 w-6 animate-pulse" />
              </span>
            ) : (
              <div className="flex flex-col items-center text-rose-400">
                <span className="rounded-full bg-rose-100 p-2 mb-2 transition-transform group-hover:scale-110">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-medium tracking-wide">ADD PHOTO</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 text-center">
        Drag to reorder. The first photo will be your main profile picture.
      </p>
    </div>
  );
}
