"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ImageUploader({
  images,
  onChange,
  max = 8,
  label = "Images",
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files).slice(0, max - images.length)) {
        const url = await uploadFile(file);
        newUrls.push(url);
      }
      onChange([...images, ...newUrls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url + i} className="relative h-24 w-24 rounded-xl overflow-hidden glass-card">
            <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 icon-btn-glass h-7 w-7"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label
            className={cn(
              "flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 y-card text-slate-600 hover:border-brand-500 transition-colors",
              uploading && "opacity-60 pointer-events-none"
            )}
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <span className="text-[10px] mt-1">Upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">Or paste URLs below after uploading elsewhere.</p>
    </div>
  );
}

export function ImageGallery({
  images,
  onDelete,
  canDelete,
}: {
  images: { id: string; url: string }[];
  onDelete?: (imageId: string) => void;
  canDelete?: boolean;
}) {
  if (!images.length) return <p className="text-sm text-slate-600">No images yet.</p>;
  return (
    <div className="flex flex-wrap gap-3">
      {images.map((img) => (
        <div key={img.id} className="relative h-28 w-28 rounded-xl overflow-hidden glass-card">
          <Image src={img.url} alt="" fill className="object-cover" sizes="112px" />
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(img.id)}
              className="absolute top-1 right-1 icon-btn-glass h-7 w-7"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
