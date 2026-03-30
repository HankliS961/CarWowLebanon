"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  GitCompare,
  X,
  Loader2,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";

interface CompareClientProps {
  isAr: boolean;
}

/** A single car slot for comparison selection. */
interface CarSlot {
  makeSlug: string | null;
  modelSlug: string | null;
  carId: string | null;
  /** When a car was pre-loaded from DB, we store its data to skip manual selection. */
  preloaded?: boolean;
}

const EMPTY_SLOT: CarSlot = {
  makeSlug: null,
  modelSlug: null,
  carId: null,
  preloaded: false,
};

const MAX_SLOTS = 3;

// Spec row definition for comparison table
interface SpecRow {
  label: string;
  key: string;
  format?: (val: unknown) => string;
  higherIsBetter?: boolean;
  lowerIsBetter?: boolean;
}

export function CompareClient({ isAr }: CompareClientProps) {
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const searchParams = useSearchParams();
  const replaceCarId = searchParams.get("replace");

  // Number of visible slots (2 or 3)
  const [slotCount, setSlotCount] = useState<2 | 3>(2);
  const [replacePending, setReplacePending] = useState<string | null>(replaceCarId);

  const [slots, setSlots] = useState<CarSlot[]>([
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
  ]);

  const [comparing, setComparing] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);

  // ── DB compare list query (only for logged-in users) ──────────
  const { data: dbCompareList, isLoading: dbLoading } =
    trpc.compare.list.useQuery(undefined, {
      enabled: !!session,
      retry: false,
    });

  // Pre-populate slots from DB compare list
  useEffect(() => {
    if (!dbCompareList || dbLoaded) return;

    if (dbCompareList.length > 0) {
      const newSlots: CarSlot[] = [];
      for (let i = 0; i < MAX_SLOTS; i++) {
        if (i < dbCompareList.length) {
          const item = dbCompareList[i];
          newSlots.push({
            makeSlug: null,
            modelSlug: null,
            carId: item.car.id,
            preloaded: true,
          });
        } else {
          newSlots.push({ ...EMPTY_SLOT });
        }
      }
      setSlots(newSlots);
      setSlotCount(
        dbCompareList.length >= 3 ? 3 : dbCompareList.length >= 2 ? 2 : 2,
      );
      // Auto-compare if we have 2+ cars
      if (dbCompareList.length >= 2) {
        setComparing(true);
      }
    }

    setDbLoaded(true);
  }, [dbCompareList, dbLoaded]);

  // ── Clear All mutation ────────────────────────────────────────
  const clearAllMutation = trpc.compare.clearAll.useMutation({
    onSuccess: () => {
      utils.compare.list.invalidate();
      utils.compare.count.invalidate();
      setSlots([{ ...EMPTY_SLOT }, { ...EMPTY_SLOT }, { ...EMPTY_SLOT }]);
      setComparing(false);
      setSlotCount(2);
      toast.success(isAr ? "تم مسح قائمة المقارنة" : "Compare list cleared");
    },
  });

  const removeFromDbMutation = trpc.compare.remove.useMutation({
    onSuccess: () => {
      utils.compare.list.invalidate();
      utils.compare.count.invalidate();
    },
  });

  const addToDbMutation = trpc.compare.add.useMutation({
    onSuccess: () => {
      utils.compare.list.invalidate();
      utils.compare.count.invalidate();
      utils.compare.isInCompare.invalidate();
    },
  });

  // ── Handle replace mode (arrived via ?replace=carId) ────────
  useEffect(() => {
    if (!replacePending || !dbLoaded || !dbCompareList) return;
    // If the car is already in the list, nothing to do
    if (dbCompareList.some((item) => item.car.id === replacePending)) {
      setReplacePending(null);
      return;
    }
    // Show the replace banner — user will click "Replace" on a slot
  }, [replacePending, dbLoaded, dbCompareList]);

  const handleReplaceSlot = (index: number) => {
    if (!replacePending) return;
    const oldSlot = slots[index];
    // Remove old car from DB
    if (oldSlot.carId && session) {
      removeFromDbMutation.mutate({ carId: oldSlot.carId });
    }
    // Add new car to DB
    addToDbMutation.mutate({ carId: replacePending });
    // Update slot locally
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { makeSlug: null, modelSlug: null, carId: replacePending, preloaded: true };
      return next;
    });
    setReplacePending(null);
    setComparing(false);
    toast.success(isAr ? "تم استبدال السيارة" : "Car replaced in compare");
    // Clean up URL
    window.history.replaceState({}, "", window.location.pathname);
  };

  // ── Make list query ──────────────────────────────────────────
  const { data: makes, isLoading: makesLoading } =
    trpc.tools.getCarMakes.useQuery(undefined, { retry: false });

  // ── Model list queries (one per slot) ────────────────────────
  const getMakeId = (makeSlug: string | null) => {
    if (!makeSlug || !makes) return undefined;
    const found = makes.find((m) => m.slug === makeSlug);
    return found ? found.id : undefined;
  };

  const makeIdSlot0 = useMemo(
    () => getMakeId(slots[0].makeSlug),
    [slots[0].makeSlug, makes],
  );
  const makeIdSlot1 = useMemo(
    () => getMakeId(slots[1].makeSlug),
    [slots[1].makeSlug, makes],
  );
  const makeIdSlot2 = useMemo(
    () => getMakeId(slots[2].makeSlug),
    [slots[2].makeSlug, makes],
  );

  const { data: modelsSlot0 } = trpc.tools.getCarModels.useQuery(
    { makeId: makeIdSlot0! },
    { enabled: !!makeIdSlot0, retry: false },
  );
  const { data: modelsSlot1 } = trpc.tools.getCarModels.useQuery(
    { makeId: makeIdSlot1! },
    { enabled: !!makeIdSlot1, retry: false },
  );
  const { data: modelsSlot2 } = trpc.tools.getCarModels.useQuery(
    { makeId: makeIdSlot2! },
    { enabled: !!makeIdSlot2, retry: false },
  );

  const modelsForSlot = [modelsSlot0, modelsSlot1, modelsSlot2];

  // ── Car search queries (one per slot, once make + model selected) ─
  const getNames = (
    slot: CarSlot,
    models: typeof modelsSlot0,
  ) => {
    if (!slot.makeSlug || !makes) return { makeName: undefined, modelName: undefined };
    const makeFound = makes.find((m) => m.slug === slot.makeSlug);
    const makeName = makeFound?.nameEn;
    if (!slot.modelSlug || !models) return { makeName, modelName: undefined };
    const modelFound = models.find((m) => m.slug === slot.modelSlug);
    return { makeName, modelName: modelFound?.nameEn };
  };

  const names0 = getNames(slots[0], modelsSlot0);
  const names1 = getNames(slots[1], modelsSlot1);
  const names2 = getNames(slots[2], modelsSlot2);

  const { data: carsSlot0, isLoading: carsSlot0Loading } =
    trpc.cars.list.useQuery(
      { make: names0.makeName!, model: names0.modelName!, page: 1, limit: 20 },
      { enabled: !!names0.makeName && !!names0.modelName, retry: false },
    );
  const { data: carsSlot1, isLoading: carsSlot1Loading } =
    trpc.cars.list.useQuery(
      { make: names1.makeName!, model: names1.modelName!, page: 1, limit: 20 },
      { enabled: !!names1.makeName && !!names1.modelName, retry: false },
    );
  const { data: carsSlot2, isLoading: carsSlot2Loading } =
    trpc.cars.list.useQuery(
      { make: names2.makeName!, model: names2.modelName!, page: 1, limit: 20 },
      { enabled: !!names2.makeName && !!names2.modelName, retry: false },
    );

  const carsForSlot = [carsSlot0, carsSlot1, carsSlot2];
  const carsLoadingForSlot = [carsSlot0Loading, carsSlot1Loading, carsSlot2Loading];

  // ── Full car detail queries ────────────────────────────────────
  // Always-enabled for preloaded slots, only when comparing for manual slots
  const { data: carDetail0, isLoading: carDetail0Loading } =
    trpc.cars.getById.useQuery(
      { id: slots[0].carId! },
      { enabled: !!slots[0].carId && (comparing || slots[0].preloaded), retry: false },
    );
  const { data: carDetail1, isLoading: carDetail1Loading } =
    trpc.cars.getById.useQuery(
      { id: slots[1].carId! },
      { enabled: !!slots[1].carId && (comparing || slots[1].preloaded), retry: false },
    );
  const { data: carDetail2, isLoading: carDetail2Loading } =
    trpc.cars.getById.useQuery(
      { id: slots[2].carId! },
      { enabled: !!slots[2].carId && (comparing || slots[2].preloaded), retry: false },
    );

  const carDetails = [carDetail0, carDetail1, carDetail2];
  const carDetailsLoading = [carDetail0Loading, carDetail1Loading, carDetail2Loading];

  // ── Helpers ──────────────────────────────────────────────────────

  const updateSlot = (index: number, update: Partial<CarSlot>) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...update };
      return next;
    });
    if (comparing) setComparing(false);
  };

  const clearSlot = (index: number) => {
    const slot = slots[index];
    // Remove from DB if the user had it there
    if (slot.carId && session) {
      removeFromDbMutation.mutate({ carId: slot.carId });
    }
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...EMPTY_SLOT };
      return next;
    });
    if (comparing) setComparing(false);
  };

  const activeSlots = slots.slice(0, slotCount);
  const filledCount = activeSlots.filter((s) => s.carId).length;
  const canCompare = filledCount >= 2;

  const handleCompare = () => {
    if (!canCompare) {
      toast.error(
        isAr
          ? "يرجى اختيار سيارتين على الأقل للمقارنة"
          : "Please select at least 2 cars to compare",
      );
      return;
    }
    setComparing(true);
  };

  const handleClearAll = () => {
    if (session) {
      clearAllMutation.mutate();
    } else {
      setSlots([{ ...EMPTY_SLOT }, { ...EMPTY_SLOT }, { ...EMPTY_SLOT }]);
      setComparing(false);
    }
  };

  const addSlot = () => {
    if (slotCount < MAX_SLOTS) {
      setSlotCount(3);
    }
  };

  const removeSlot = () => {
    if (slotCount > 2) {
      clearSlot(2);
      setSlotCount(2);
    }
  };

  // Parse images from car listing
  const getCarImage = (car: Record<string, unknown>): string | null => {
    if (car.thumbnailUrl && typeof car.thumbnailUrl === "string")
      return car.thumbnailUrl;
    const imgs = car.images;
    if (Array.isArray(imgs) && imgs.length > 0) return String(imgs[0]);
    return null;
  };

  // Parse features from car listing
  const getFeatures = (car: Record<string, unknown>): string[] => {
    const raw = car.features;
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Source label
  const sourceLabel = (source: string | null | undefined) => {
    if (!source) return "N/A";
    const map: Record<string, string> = {
      LOCAL: "Local",
      IMPORTED_USA: "Imported (USA)",
      IMPORTED_GULF: "Imported (Gulf)",
      IMPORTED_EUROPE: "Imported (Europe)",
      SALVAGE_REBUILT: "Salvage / Rebuilt",
    };
    return map[source] ?? source;
  };

  const drivetrainLabel = (dt: string | null | undefined) => {
    if (!dt) return "N/A";
    const map: Record<string, string> = {
      FWD: "Front-Wheel Drive",
      RWD: "Rear-Wheel Drive",
      AWD: "All-Wheel Drive",
      FOUR_WD: "4WD",
    };
    return map[dt] ?? dt;
  };

  // ── Spec rows ────────────────────────────────────────────────────
  const specRows: SpecRow[] = [
    { label: isAr ? "السنة" : "Year", key: "year", higherIsBetter: true },
    {
      label: isAr ? "السعر (USD)" : "Price (USD)",
      key: "priceUsd",
      format: (v) => (v ? `$${Number(v).toLocaleString()}` : "N/A"),
      lowerIsBetter: true,
    },
    {
      label: isAr ? "المسافة المقطوعة" : "Mileage",
      key: "mileageKm",
      format: (v) => (v != null ? `${Number(v).toLocaleString()} km` : "N/A"),
      lowerIsBetter: true,
    },
    { label: isAr ? "الحالة" : "Condition", key: "condition" },
    { label: isAr ? "نوع الهيكل" : "Body Type", key: "bodyType" },
    { label: isAr ? "نوع الوقود" : "Fuel Type", key: "fuelType" },
    { label: isAr ? "ناقل الحركة" : "Transmission", key: "transmission" },
    {
      label: isAr ? "نظام الدفع" : "Drivetrain",
      key: "drivetrain",
      format: (v) => drivetrainLabel(v as string),
    },
    { label: isAr ? "حجم المحرك" : "Engine Size", key: "engineSize" },
    {
      label: isAr ? "القوة الحصانية" : "Horsepower",
      key: "horsepower",
      format: (v) => (v ? `${v} hp` : "N/A"),
      higherIsBetter: true,
    },
    {
      label: isAr ? "المصدر" : "Source",
      key: "source",
      format: (v) => sourceLabel(v as string),
    },
    { label: isAr ? "اللون الخارجي" : "Exterior Color", key: "colorExterior" },
    { label: isAr ? "اللون الداخلي" : "Interior Color", key: "colorInterior" },
    {
      label: isAr ? "تاريخ الحوادث" : "Accident History",
      key: "accidentHistory",
      format: (v) =>
        v === true ? "Yes" : v === false ? "No" : "N/A",
    },
  ];

  const getVal = (car: Record<string, unknown>, key: string): unknown => {
    return car[key] ?? null;
  };

  const formatVal = (row: SpecRow, val: unknown): string => {
    if (row.format) return row.format(val);
    if (val == null || val === "") return "N/A";
    return String(val);
  };

  // Compare numeric values across multiple cars for highlighting
  const getBestIndex = (
    row: SpecRow,
    values: unknown[],
  ): number | null => {
    if (!row.higherIsBetter && !row.lowerIsBetter) return null;
    const nums = values.map((v) => Number(v));
    const validNums = nums.filter((n) => !isNaN(n));
    if (validNums.length < 2) return null;

    let bestVal: number;
    if (row.higherIsBetter) {
      bestVal = Math.max(...validNums);
    } else {
      bestVal = Math.min(...validNums);
    }

    // Check if all are the same (tie)
    if (validNums.every((n) => n === bestVal)) return null;

    const bestIdx = nums.findIndex((n) => n === bestVal);
    return bestIdx >= 0 ? bestIdx : null;
  };

  // ── Render ───────────────────────────────────────────────────────

  // Get the active car details that have been fetched
  const activeCarDetails = activeSlots.map((_, i) => carDetails[i]);
  const activeCarsWithData = activeCarDetails.filter(Boolean);
  const isCompareLoading =
    comparing &&
    activeSlots.some(
      (s, i) => s.carId && carDetailsLoading[i],
    );

  // Show loading spinner while loading DB list
  if (session && dbLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        <span className="ml-2 text-muted-foreground">
          {isAr ? "جاري تحميل قائمة المقارنة..." : "Loading compare list..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Replace mode banner ────────────────────────────────── */}
      {replacePending && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-800">
                {isAr ? "قائمة المقارنة ممتلئة" : "Compare list is full"}
              </p>
              <p className="text-sm text-amber-700">
                {isAr
                  ? "اضغط \"استبدال\" على السيارة التي تريد إزالتها"
                  : "Click \"Replace\" on the car you want to swap out"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplacePending(null);
                window.history.replaceState({}, "", window.location.pathname);
              }}
            >
              <X className="mr-1 h-4 w-4" />
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Actions bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {slotCount < MAX_SLOTS && (
            <Button variant="outline" size="sm" onClick={addSlot}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              {isAr ? "أضف سيارة ثالثة" : "Add 3rd Car"}
            </Button>
          )}
          {slotCount === 3 && (
            <Button variant="ghost" size="sm" onClick={removeSlot}>
              {isAr ? "إزالة الخانة الثالثة" : "Remove 3rd Slot"}
            </Button>
          )}
        </div>
        {filledCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={clearAllMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {isAr ? "مسح الكل" : "Clear All"}
          </Button>
        )}
      </div>

      {/* ── Selection Panels ─────────────────────────────────────── */}
      <div
        className={`grid gap-6 ${
          slotCount === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {activeSlots.map((slot, idx) => {
          const slotModels = modelsForSlot[idx];
          const slotCars = carsForSlot[idx];
          const slotCarsLoading = carsLoadingForSlot[idx];
          const selectedCar = slotCars?.cars?.find(
            (c) => c.id === slot.carId,
          );

          // If preloaded from DB, show a compact preview
          const preloadedCar = slot.preloaded ? carDetails[idx] : null;

          return (
            <Card key={idx}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {isAr ? `السيارة ${idx + 1}` : `Car ${idx + 1}`}
                  </h3>
                  <div className="flex items-center gap-1">
                    {replacePending && slot.carId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs"
                        onClick={() => handleReplaceSlot(idx)}
                      >
                        {isAr ? "استبدال" : "Replace"}
                      </Button>
                    )}
                    {(slot.makeSlug || slot.carId) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => clearSlot(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Preloaded car from DB */}
                {slot.preloaded && preloadedCar ? (
                  <div className="space-y-3">
                    <div className="rounded-md border border-teal-200 bg-teal-50/50 p-3 dark:bg-teal-950/30">
                      {(() => {
                        const img = getCarImage(
                          preloadedCar as unknown as Record<string, unknown>,
                        );
                        return img ? (
                          <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md">
                            <Image
                              src={img}
                              alt={`${preloadedCar.year} ${preloadedCar.make} ${preloadedCar.model}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 320px"
                            />
                          </div>
                        ) : null;
                      })()}
                      <p className="text-sm font-medium">
                        {preloadedCar.year} {preloadedCar.make}{" "}
                        {preloadedCar.model}
                        {preloadedCar.trim ? ` ${preloadedCar.trim}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${Number(preloadedCar.priceUsd).toLocaleString()} |{" "}
                        {preloadedCar.mileageKm.toLocaleString()} km |{" "}
                        {preloadedCar.fuelType} | {preloadedCar.transmission}
                      </p>
                    </div>
                  </div>
                ) : slot.preloaded && !preloadedCar ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isAr ? "جاري التحميل..." : "Loading..."}
                  </div>
                ) : (
                  <>
                    {/* Make dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {isAr ? "الشركة المصنعة" : "Make"}
                      </label>
                      <Select
                        value={slot.makeSlug ?? ""}
                        onValueChange={(val) =>
                          updateSlot(idx, {
                            makeSlug: val,
                            modelSlug: null,
                            carId: null,
                            preloaded: false,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              makesLoading
                                ? isAr
                                  ? "جاري التحميل..."
                                  : "Loading..."
                                : isAr
                                  ? "اختر الشركة المصنعة"
                                  : "Select make"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {(makes ?? []).map((make) => (
                            <SelectItem key={make.slug} value={make.slug}>
                              {isAr ? make.nameAr : make.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model dropdown */}
                    {slot.makeSlug && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {isAr ? "الطراز" : "Model"}
                        </label>
                        <Select
                          value={slot.modelSlug ?? ""}
                          onValueChange={(val) =>
                            updateSlot(idx, {
                              modelSlug: val,
                              carId: null,
                              preloaded: false,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isAr ? "اختر الطراز" : "Select model"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(slotModels ?? []).map((model) => (
                              <SelectItem key={model.slug} value={model.slug}>
                                {isAr ? model.nameAr : model.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Car listing results */}
                    {slot.makeSlug && slot.modelSlug && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {isAr ? "اختر سيارة" : "Pick a listing"}
                        </label>
                        {slotCarsLoading ? (
                          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isAr ? "جاري البحث..." : "Searching..."}
                          </div>
                        ) : (slotCars?.cars?.length ?? 0) === 0 ? (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            {isAr
                              ? "لا توجد سيارات متاحة"
                              : "No cars available for this selection"}
                          </p>
                        ) : (
                          <div className="max-h-52 space-y-2 overflow-y-auto rounded-md border p-2">
                            {slotCars!.cars.map((car) => {
                              const img = getCarImage(
                                car as unknown as Record<string, unknown>,
                              );
                              const isSelected = slot.carId === car.id;
                              return (
                                <button
                                  key={car.id}
                                  type="button"
                                  className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors ${
                                    isSelected
                                      ? "bg-teal-50 ring-2 ring-teal-500 dark:bg-teal-950"
                                      : "hover:bg-muted"
                                  }`}
                                  onClick={() =>
                                    updateSlot(idx, {
                                      carId: car.id,
                                      preloaded: false,
                                    })
                                  }
                                >
                                  {img ? (
                                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded">
                                      <Image
                                        src={img}
                                        alt={`${car.year} ${car.make} ${car.model}`}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-muted">
                                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                      {car.year} {car.make} {car.model}
                                      {car.trim ? ` ${car.trim}` : ""}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ${Number(car.priceUsd).toLocaleString()}{" "}
                                      | {car.mileageKm.toLocaleString()} km
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Badge
                                      variant="default"
                                      className="shrink-0 bg-teal-500"
                                    >
                                      {isAr ? "محدد" : "Selected"}
                                    </Badge>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected car preview (manual selection) */}
                    {selectedCar && (
                      <div className="rounded-md border border-teal-200 bg-teal-50/50 p-3 dark:bg-teal-950/30">
                        <p className="text-sm font-medium">
                          {selectedCar.year} {selectedCar.make}{" "}
                          {selectedCar.model}
                          {selectedCar.trim ? ` ${selectedCar.trim}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${Number(selectedCar.priceUsd).toLocaleString()} |{" "}
                          {selectedCar.mileageKm.toLocaleString()} km |{" "}
                          {selectedCar.fuelType} | {selectedCar.transmission}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Compare Button ───────────────────────────────────────── */}
      {!comparing && (
        <div className="text-center">
          <Button
            onClick={handleCompare}
            disabled={!canCompare || isCompareLoading}
            className="bg-teal-500 text-white hover:bg-teal-600"
            size="lg"
          >
            {isCompareLoading ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <GitCompare className="me-2 h-4 w-4" />
            )}
            {isAr ? "قارن الآن" : "Compare Now"}
          </Button>
          {!canCompare && (
            <p className="mt-2 text-xs text-muted-foreground">
              {isAr
                ? "اختر سيارتين على الأقل للمقارنة"
                : "Select at least 2 cars to compare"}
            </p>
          )}
        </div>
      )}

      {/* ── Comparison Table ─────────────────────────────────────── */}
      {comparing && (() => {
        // Gather the cars we have data for
        const carsToCompare = activeSlots
          .map((slot, i) => (slot.carId ? carDetails[i] : null))
          .filter(Boolean) as NonNullable<typeof carDetail0>[];

        if (carsToCompare.length < 2) {
          if (isCompareLoading) {
            return (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                <span className="ml-2 text-muted-foreground">
                  {isAr ? "جاري تحميل البيانات..." : "Loading car data..."}
                </span>
              </div>
            );
          }
          return null;
        }

        const colCount = carsToCompare.length;

        return (
          <div className="space-y-6">
            <Separator />
            <h2 className="text-center text-xl font-bold">
              {isAr ? "نتائج المقارنة" : "Comparison Results"}
            </h2>

            {/* Car header images */}
            <div
              className={`grid gap-4 ${
                colCount === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {carsToCompare.map((car, i) => {
                const carObj = car as unknown as Record<string, unknown>;
                const img = getCarImage(carObj);
                return (
                  <div key={i} className="text-center">
                    {img ? (
                      <div className="relative mx-auto aspect-video w-full max-w-xs overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={img}
                          alt={`${car.year} ${car.make} ${car.model}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 320px"
                        />
                      </div>
                    ) : (
                      <div className="mx-auto flex aspect-video w-full max-w-xs items-center justify-center rounded-lg bg-muted">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                    )}
                    <h3 className="mt-2 font-semibold">
                      {car.year} {car.make} {car.model}
                      {car.trim ? ` ${car.trim}` : ""}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* Spec table */}
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          {isAr ? "المواصفة" : "Specification"}
                        </th>
                        {carsToCompare.map((car, i) => (
                          <th key={i} className="px-4 py-3 text-center font-medium">
                            {car.make} {car.model}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {specRows.map((row, i) => {
                        const values = carsToCompare.map((car) =>
                          getVal(
                            car as unknown as Record<string, unknown>,
                            row.key,
                          ),
                        );
                        const bestIdx = getBestIndex(row, values);

                        return (
                          <tr
                            key={row.key}
                            className={i % 2 === 0 ? "" : "bg-muted/30"}
                          >
                            <td className="px-4 py-2.5 font-medium text-muted-foreground">
                              {row.label}
                            </td>
                            {values.map((val, ci) => (
                              <td
                                key={ci}
                                className={`px-4 py-2.5 text-center ${
                                  bestIdx === ci
                                    ? "font-bold text-teal-600 dark:text-teal-400"
                                    : ""
                                }`}
                              >
                                {formatVal(row, val)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Features comparison */}
            {(() => {
              const allFeatArrays = carsToCompare.map((car) =>
                getFeatures(car as unknown as Record<string, unknown>),
              );
              const allFeatures = Array.from(
                new Set(allFeatArrays.flat()),
              ).sort();

              if (allFeatures.length === 0) return null;

              return (
                <div className="space-y-3">
                  <h3 className="font-semibold">
                    {isAr ? "المميزات" : "Features"}
                  </h3>
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                {isAr ? "الميزة" : "Feature"}
                              </th>
                              {carsToCompare.map((car, i) => (
                                <th
                                  key={i}
                                  className="px-4 py-2 text-center font-medium"
                                >
                                  {car.make} {car.model}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allFeatures.map((feat, i) => (
                              <tr
                                key={feat}
                                className={i % 2 === 0 ? "" : "bg-muted/30"}
                              >
                                <td className="px-4 py-2 text-muted-foreground">
                                  {feat}
                                </td>
                                {allFeatArrays.map((feats, ci) => (
                                  <td key={ci} className="px-4 py-2 text-center">
                                    {feats.includes(feat) ? (
                                      <Badge
                                        variant="default"
                                        className="bg-teal-500"
                                      >
                                        {isAr ? "نعم" : "Yes"}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        --
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Dealer info */}
            <div
              className={`grid gap-4 ${
                colCount === 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2"
              }`}
            >
              {carsToCompare.map((car, i) => {
                const dealer = car.dealer;
                if (!dealer) return null;
                return (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        {isAr ? "التاجر" : "Dealer"}
                      </h4>
                      <p className="mt-1 font-medium">
                        {isAr
                          ? dealer.companyNameAr || dealer.companyName
                          : dealer.companyName}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {dealer.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            {isAr ? "موثق" : "Verified"}
                          </Badge>
                        )}
                        {dealer.city && (
                          <Badge variant="outline" className="text-xs">
                            {dealer.city}
                          </Badge>
                        )}
                        {dealer.ratingAvg != null && (
                          <Badge variant="outline" className="text-xs">
                            {Number(dealer.ratingAvg).toFixed(1)} / 5
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
