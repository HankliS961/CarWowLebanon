"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ImageIcon,
  Upload,
  Trash2,
  Loader2,
  Car,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { trpc } from "@/lib/trpc/client";

const BODY_TYPES = [
  "SUV",
  "SEDAN",
  "HATCHBACK",
  "PICKUP",
  "COUPE",
  "CONVERTIBLE",
  "VAN",
  "WAGON",
  "ELECTRIC",
] as const;

/** Upload a file to R2 via /api/upload and return the URL. */
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Upload failed");
  }

  const { url } = await response.json();
  return url;
}

/** Admin page for managing site-wide static images (make logos, body type images). */
export default function AdminSiteImagesPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      <PageHeader title="Site Images" />

      <Tabs defaultValue="make-logos">
        <TabsList className="flex-wrap">
          <TabsTrigger value="make-logos">Car Make Logos</TabsTrigger>
          <TabsTrigger value="body-types">Body Type Images</TabsTrigger>
          <TabsTrigger value="general">General / Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="make-logos" className="mt-6">
          <MakeLogosTab />
        </TabsContent>

        <TabsContent value="body-types" className="mt-6">
          <BodyTypeImagesTab />
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <GeneralImagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// Car Make Logos Tab
// =============================================================================

function MakeLogosTab() {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMakeId, setActiveMakeId] = useState<number | null>(null);
  const [uploadingMakeId, setUploadingMakeId] = useState<number | null>(null);

  const { data: makes, isLoading } = trpc.carMakes.list.useQuery(undefined, {
    retry: false,
  });

  const updateLogo = trpc.carMakes.updateLogo.useMutation({
    onSuccess: () => {
      toast.success("Logo updated successfully");
      utils.carMakes.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const openFilePicker = (makeId: number) => {
    setActiveMakeId(makeId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || activeMakeId === null) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }

      const makeId = activeMakeId;
      setUploadingMakeId(makeId);

      try {
        const url = await uploadFile(file);
        await updateLogo.mutateAsync({ makeId, logoUrl: url });
      } catch (error) {
        toast.error("Upload failed. Please try again.");
        console.error("Logo upload error:", error);
      } finally {
        setUploadingMakeId(null);
        event.target.value = "";
      }
    },
    [activeMakeId, updateLogo],
  );

  const handleRemoveLogo = (makeId: number) => {
    updateLogo.mutate({ makeId, logoUrl: null });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(makes ?? []).map((make) => (
          <Card key={make.id} className="overflow-hidden">
            <CardContent className="flex flex-col items-center gap-3 p-4">
              {/* Logo display */}
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-muted bg-muted/50">
                {uploadingMakeId === make.id ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : make.logoUrl ? (
                  <Image
                    src={make.logoUrl}
                    alt={make.nameEn}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {make.nameEn.charAt(0)}
                  </span>
                )}
              </div>

              {/* Make name */}
              <div className="text-center">
                <p className="text-sm font-medium">{make.nameEn}</p>
                <p className="text-xs text-muted-foreground">{make.nameAr}</p>
              </div>

              {/* Actions */}
              <div className="flex w-full gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => openFilePicker(make.id)}
                  disabled={uploadingMakeId === make.id || updateLogo.isPending}
                >
                  <Upload className="mr-1 h-3 w-3" />
                  {make.logoUrl ? "Replace" : "Upload"}
                </Button>
                {make.logoUrl && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                    onClick={() => handleRemoveLogo(make.id)}
                    disabled={updateLogo.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(makes ?? []).length === 0 && (
        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <Car className="mb-3 h-12 w-12" />
          <p className="text-sm">No car makes found. Add makes via the database seed.</p>
        </div>
      )}
    </>
  );
}

// =============================================================================
// Body Type Images Tab
// =============================================================================

function BodyTypeImagesTab() {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const { data: siteImages, isLoading } = trpc.admin.listSiteImages.useQuery(
    { category: "body_type" },
    { retry: false },
  );

  const upsertImage = trpc.admin.upsertSiteImage.useMutation({
    onSuccess: () => {
      toast.success("Body type image updated");
      utils.admin.listSiteImages.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteImage = trpc.admin.deleteSiteImage.useMutation({
    onSuccess: () => {
      toast.success("Image removed");
      utils.admin.listSiteImages.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Build a lookup from key -> image record
  const imageMap = new Map(
    (siteImages ?? []).map((img) => [img.key, img]),
  );

  const openFilePicker = (key: string) => {
    setActiveKey(key);
    fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || activeKey === null) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }

      const key = activeKey;
      setUploadingKey(key);

      try {
        const url = await uploadFile(file);
        await upsertImage.mutateAsync({
          category: "body_type",
          key,
          imageUrl: url,
          label: key.charAt(0) + key.slice(1).toLowerCase(),
        });
      } catch (error) {
        toast.error("Upload failed. Please try again.");
        console.error("Body type image upload error:", error);
      } finally {
        setUploadingKey(null);
        event.target.value = "";
      }
    },
    [activeKey, upsertImage],
  );

  const handleRemoveImage = (key: string) => {
    const img = imageMap.get(key);
    if (img) {
      deleteImage.mutate({ id: img.id });
    }
  };

  const GRADIENT_COLORS: Record<string, string> = {
    SUV: "from-teal-500 to-teal-700",
    SEDAN: "from-blue-500 to-blue-700",
    HATCHBACK: "from-purple-500 to-purple-700",
    PICKUP: "from-amber-500 to-amber-700",
    COUPE: "from-rose-500 to-rose-700",
    CONVERTIBLE: "from-cyan-500 to-cyan-700",
    VAN: "from-orange-500 to-orange-700",
    WAGON: "from-emerald-500 to-emerald-700",
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {BODY_TYPES.map((type) => {
          const existing = imageMap.get(type);
          const gradient = GRADIENT_COLORS[type] ?? "from-gray-500 to-gray-700";

          return (
            <Card key={type} className="overflow-hidden">
              <CardContent className="flex flex-col gap-3 p-4">
                {/* Image preview */}
                <div
                  className={`relative flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${gradient}`}
                >
                  {uploadingKey === type ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  ) : existing ? (
                    <Image
                      src={existing.imageUrl}
                      alt={type}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white/60">
                      <ImageIcon className="h-10 w-10" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>

                {/* Type label */}
                <p className="text-center text-sm font-semibold">
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => openFilePicker(type)}
                    disabled={
                      uploadingKey === type ||
                      upsertImage.isPending ||
                      deleteImage.isPending
                    }
                  >
                    <Upload className="mr-1 h-3 w-3" />
                    {existing ? "Replace" : "Upload"}
                  </Button>
                  {existing && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                      onClick={() => handleRemoveImage(type)}
                      disabled={deleteImage.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

// =============================================================================
// General / Banners Tab
// =============================================================================

const GENERAL_IMAGES = [
  { key: "hero_background", label: "Homepage Hero Background", description: "Main hero section background image (1920x800 recommended)" },
  { key: "hero_pattern", label: "Hero Pattern Overlay", description: "Subtle pattern overlay on the hero (SVG or transparent PNG)" },
  { key: "sell_hero", label: "Sell My Car Hero", description: "Background for the Sell My Car landing page" },
  { key: "car_placeholder", label: "Car Placeholder", description: "Default image when a car listing has no photo" },
  { key: "blog_placeholder", label: "Blog Placeholder", description: "Default image when a blog post has no featured image" },
  { key: "dealer_placeholder", label: "Dealer Placeholder", description: "Default image when a dealer has no logo" },
  { key: "site_logo", label: "Site Logo", description: "CarSouk logo used in header and emails" },
  { key: "site_logo_dark", label: "Site Logo (Dark)", description: "Logo variant for dark backgrounds" },
  { key: "og_image", label: "Default OG Image", description: "Default social share image (1200x630)" },
] as const;

function GeneralImagesTab() {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const { data: siteImages, isLoading } = trpc.admin.listSiteImages.useQuery(
    { category: "general" },
    { retry: false },
  );

  const upsertImage = trpc.admin.upsertSiteImage.useMutation({
    onSuccess: () => {
      utils.admin.listSiteImages.invalidate();
      toast.success("Image updated");
    },
    onError: (err) => toast.error(err.message || "Failed to update image"),
  });

  const deleteImage = trpc.admin.deleteSiteImage.useMutation({
    onSuccess: () => {
      utils.admin.listSiteImages.invalidate();
      toast.success("Image removed");
    },
    onError: (err) => toast.error(err.message || "Failed to remove image"),
  });

  const imageMap = new Map(
    (siteImages ?? []).map((img) => [img.key, img]),
  );

  const openFilePicker = (key: string) => {
    setActiveKey(key);
    fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !activeKey) return;
      if (!file.type.startsWith("image/") && !file.type.includes("svg")) return;
      if (file.size > 10 * 1024 * 1024) return;

      setUploadingKey(activeKey);
      try {
        const url = await uploadFile(file);
        upsertImage.mutate({ category: "general", key: activeKey, imageUrl: url });
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploadingKey(null);
        event.target.value = "";
      }
    },
    [activeKey, upsertImage],
  );

  const handleRemoveImage = (key: string) => {
    const img = imageMap.get(key);
    if (img) deleteImage.mutate({ id: img.id });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><div className="h-40 animate-pulse rounded bg-muted" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GENERAL_IMAGES.map((item) => {
          const existing = imageMap.get(item.key);
          const isUploading = uploadingKey === item.key;

          return (
            <Card key={item.key} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {/* Preview */}
                <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                  {existing ? (
                    existing.imageUrl.endsWith(".svg") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={existing.imageUrl}
                        alt={item.label}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Image
                        src={existing.imageUrl}
                        alt={item.label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        unoptimized={existing.imageUrl.startsWith("data:")}
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => openFilePicker(item.key)}
                    disabled={isUploading || upsertImage.isPending}
                  >
                    <Upload className="mr-1 h-3 w-3" />
                    {existing ? "Replace" : "Upload"}
                  </Button>
                  {existing && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                      onClick={() => handleRemoveImage(item.key)}
                      disabled={deleteImage.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
