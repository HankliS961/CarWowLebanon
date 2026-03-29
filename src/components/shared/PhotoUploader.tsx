"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Camera, Upload, X, Check, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PhotoSlot {
  key: string;
  labelKey: string;
  required: boolean;
}

export const PHOTO_SLOTS: PhotoSlot[] = [
  { key: "front", labelKey: "photoFront", required: true },
  { key: "rear", labelKey: "photoRear", required: true },
  { key: "left", labelKey: "photoLeft", required: true },
  { key: "right", labelKey: "photoRight", required: true },
  { key: "dashboard", labelKey: "photoDashboard", required: false },
  { key: "odometer", labelKey: "photoOdometer", required: false },
  { key: "damage", labelKey: "photoDamage", required: false },
];

interface PhotoUploaderProps {
  photos: Record<string, string>;
  onPhotoAdd: (slot: string, url: string) => void;
  onPhotoRemove: (slot: string) => void;
  showDamageSlot?: boolean;
  className?: string;
}

export function PhotoUploader({
  photos,
  onPhotoAdd,
  onPhotoRemove,
  showDamageSlot = false,
  className,
}: PhotoUploaderProps) {
  const t = useTranslations("sell.form");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<string>("");
  const [uploadingSlots, setUploadingSlots] = useState<Set<string>>(new Set());

  const slots = PHOTO_SLOTS.filter(
    (slot) => slot.key !== "damage" || showDamageSlot
  );

  const photoCount = Object.keys(photos).length;

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return; // Max 10MB

      const slot = activeSlotRef.current;

      // Show a loading preview immediately using an object URL
      const tempUrl = URL.createObjectURL(file);
      onPhotoAdd(slot, tempUrl);
      setUploadingSlots((prev) => new Set(prev).add(slot));

      try {
        // Upload to R2 via API
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const { url } = await response.json();
        // Replace temp URL with the real R2 URL (or data URL fallback in dev)
        onPhotoAdd(slot, url);
      } catch (error) {
        console.error("Upload failed:", error);
        // Keep the temp object URL as fallback (works locally)
      } finally {
        setUploadingSlots((prev) => {
          const next = new Set(prev);
          next.delete(slot);
          return next;
        });
      }

      // Reset the input so the same file can be re-selected
      event.target.value = "";
    },
    [onPhotoAdd]
  );

  const openFilePicker = (slotKey: string) => {
    activeSlotRef.current = slotKey;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />

      {/* Photo tips */}
      <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4">
        <h4 className="text-sm font-semibold text-teal-800">{t("photoTips")}</h4>
        <ul className="mt-2 space-y-1">
          {["photoTip1", "photoTip2", "photoTip3", "photoTip4"].map((key) => (
            <li key={key} className="flex items-start gap-2 text-xs text-teal-700">
              <Check className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Photo count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("photoMinRequired")}
        </p>
        <span
          className={cn(
            "text-sm font-semibold",
            photoCount >= 4 ? "text-emerald-600" : "text-amber-600"
          )}
        >
          {photoCount} / {slots.length}
        </span>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => {
          const hasPhoto = !!photos[slot.key];

          return (
            <div key={slot.key} className="relative">
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-dashed transition-colors",
                  hasPhoto
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-muted-foreground/20 bg-muted/30 hover:border-teal-400 hover:bg-teal-50/30"
                )}
              >
                {hasPhoto ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {photos[slot.key].startsWith("blob:") ? (
                      <img
                        src={photos[slot.key]}
                        alt={t(slot.labelKey)}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={photos[slot.key]}
                        alt={t(slot.labelKey)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized={photos[slot.key].startsWith("data:")}
                      />
                    )}
                    {uploadingSlots.has(slot.key) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                      onClick={() => onPhotoRemove(slot.key)}
                      aria-label={`Remove ${t(slot.labelKey)}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 start-0 end-0 bg-black/50 px-2 py-1">
                      <span className="text-[10px] font-medium text-white">
                        {t(slot.labelKey)}
                      </span>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="flex h-full w-full flex-col items-center justify-center gap-2 p-2"
                    onClick={() => openFilePicker(slot.key)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">
                      {t(slot.labelKey)}
                    </span>
                    {slot.required && (
                      <span className="text-[9px] font-medium text-amber-600">
                        *
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload all button for mobile */}
      <div className="flex gap-2 sm:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            const firstEmpty = slots.find((s) => !photos[s.key]);
            if (firstEmpty) openFilePicker(firstEmpty.key);
          }}
        >
          <Upload className="me-2 h-4 w-4" />
          {t("uploadOrCapture")}
        </Button>
      </div>
    </div>
  );
}

export default PhotoUploader;
