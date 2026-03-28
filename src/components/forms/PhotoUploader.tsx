"use client";

import React, { useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import {
  Camera,
  X,
  Upload,
  ImagePlus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

export interface PhotoAngle {
  /** Unique key for this angle. */
  key: string;
  /** English label. */
  label: string;
  /** Arabic label. */
  labelAr: string;
  /** Whether this angle is required. */
  required?: boolean;
  /** Guidance text in English. */
  hint?: string;
  /** Guidance text in Arabic. */
  hintAr?: string;
}

export interface UploadedPhoto {
  /** Unique ID for the uploaded photo. */
  id: string;
  /** URL of the uploaded image. */
  url: string;
  /** Which angle this photo covers. */
  angleKey: string;
}

export interface PhotoUploaderProps {
  /** Required photo angles. */
  requiredAngles: PhotoAngle[];
  /** Currently uploaded photos. */
  uploadedPhotos: UploadedPhoto[];
  /** Callback when a photo is selected for upload. */
  onUpload: (file: File, angleKey: string) => void;
  /** Callback to remove a photo. */
  onRemove: (photoId: string) => void;
  /** Minimum number of photos required. */
  minPhotos?: number;
  /** Whether an upload is in progress. */
  uploading?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

const DEFAULT_ANGLES: PhotoAngle[] = [
  { key: "front", label: "Front", labelAr: "الأمام", required: true },
  { key: "rear", label: "Rear", labelAr: "الخلف", required: true },
  { key: "left", label: "Left Side", labelAr: "الجانب الأيسر", required: true },
  { key: "right", label: "Right Side", labelAr: "الجانب الأيمن", required: true },
  { key: "dashboard", label: "Dashboard", labelAr: "لوحة القيادة", required: true },
  { key: "mileage", label: "Mileage", labelAr: "عداد الكيلومترات", required: true },
  { key: "damage", label: "Damage (if any)", labelAr: "الأضرار (إن وجدت)", required: false },
  { key: "extra", label: "Additional Photos", labelAr: "صور إضافية", required: false },
];

function PhotoSlot({
  angle,
  photo,
  onUpload,
  onRemove,
  uploading,
  locale,
}: {
  angle: PhotoAngle;
  photo: UploadedPhoto | undefined;
  onUpload: (file: File, angleKey: string) => void;
  onRemove: (photoId: string) => void;
  uploading?: boolean;
  locale: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file, angle.key);
        // Reset input so the same file can be re-selected
        e.target.value = "";
      }
    },
    [angle.key, onUpload]
  );

  const label = locale === "ar" ? angle.labelAr : angle.label;
  const hint = locale === "ar" ? angle.hintAr : angle.hint;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          photo
            ? "border-teal-300 bg-teal-50/30"
            : "border-border bg-muted/30 hover:border-teal-300 hover:bg-muted/50"
        )}
      >
        {photo ? (
          <>
            <Image
              src={photo.url}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              className="absolute end-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${label} photo`}
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-1.5 p-4 text-muted-foreground transition-colors hover:text-teal-500"
          >
            {uploading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            ) : (
              <>
                <Camera size={24} />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-label={`Upload ${label} photo`}
        />
      </div>

      {/* Label below */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-charcoal">{label}</span>
        {angle.required && (
          <span className="text-xs text-coral">*</span>
        )}
      </div>
      {hint && (
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

export function PhotoUploader({
  requiredAngles = DEFAULT_ANGLES,
  uploadedPhotos,
  onUpload,
  onRemove,
  minPhotos = 4,
  uploading = false,
  className,
}: PhotoUploaderProps) {
  const locale = useLocale() as Locale;

  const uploadedCount = uploadedPhotos.length;
  const requiredCount = requiredAngles.filter((a) => a.required).length;
  const missingRequired = requiredAngles
    .filter((a) => a.required)
    .filter((a) => !uploadedPhotos.find((p) => p.angleKey === a.key));

  const getPhotoForAngle = (angleKey: string) =>
    uploadedPhotos.find((p) => p.angleKey === angleKey);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Status bar */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ImagePlus size={18} className="text-teal-500" />
          <span className="text-sm font-medium text-charcoal">
            {uploadedCount} / {requiredAngles.length}{" "}
            {locale === "ar" ? "صور مرفوعة" : "photos uploaded"}
          </span>
        </div>
        {uploadedCount < minPhotos && (
          <div className="flex items-center gap-1 text-xs text-coral">
            <AlertCircle size={12} />
            <span>
              {locale === "ar"
                ? `مطلوب ${minPhotos} صور كحد أدنى`
                : `Minimum ${minPhotos} photos required`}
            </span>
          </div>
        )}
      </div>

      {/* Missing required alert */}
      {missingRequired.length > 0 && uploadedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {locale === "ar" ? "صور مطلوبة مفقودة: " : "Missing required photos: "}
          {missingRequired
            .map((a) => (locale === "ar" ? a.labelAr : a.label))
            .join(", ")}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {requiredAngles.map((angle) => (
          <PhotoSlot
            key={angle.key}
            angle={angle}
            photo={getPhotoForAngle(angle.key)}
            onUpload={onUpload}
            onRemove={onRemove}
            uploading={uploading}
            locale={locale}
          />
        ))}
      </div>

      {/* Bulk upload button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            // Create a hidden file input for bulk upload
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.multiple = true;
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) {
                // Assign to the first empty slots
                const emptyAngles = requiredAngles.filter(
                  (a) => !getPhotoForAngle(a.key)
                );
                Array.from(files).forEach((file, i) => {
                  if (emptyAngles[i]) {
                    onUpload(file, emptyAngles[i].key);
                  }
                });
              }
            };
            input.click();
          }}
        >
          <Upload size={14} />
          {locale === "ar" ? "رفع عدة صور" : "Upload Multiple"}
        </Button>
      </div>
    </div>
  );
}

export default PhotoUploader;
