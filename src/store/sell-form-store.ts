import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CarSourceValue =
  | "LOCAL"
  | "IMPORTED_USA"
  | "IMPORTED_GULF"
  | "IMPORTED_EUROPE"
  | "SALVAGE_REBUILT";

export type ServiceRecords = "full" | "partial" | "none";
export type SellingOption = "auction" | "asking_price";
export type ContactPref = "WHATSAPP" | "CALL" | "EMAIL";

export interface SellFormState {
  /** User ID that owns this draft — clears if different user loads it. */
  userId: string;

  /** Current step (1-5). */
  currentStep: number;

  // Step 1: Car Details
  make: string;
  makeSlug: string;
  model: string;
  year: string;
  trim: string;
  mileageKm: string;
  source: CarSourceValue | "";

  // Step 2: Condition
  accidentHistory: boolean | null;
  accidentDetails: string;
  serviceRecords: ServiceRecords | "";
  numberOfKeys: "1" | "2" | "";
  hasDamage: boolean | null;
  damageTypes: string[];
  additionalNotes: string;

  // Step 3: Photos
  photos: Record<string, string>; // slotKey -> dataURL or URL

  // Step 4: Valuation
  sellingOption: SellingOption;
  askingPrice: string;

  // Step 5: Account & Submit
  contactPreference: ContactPref;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: <K extends keyof SellFormState>(key: K, value: SellFormState[K]) => void;
  setPhoto: (slot: string, url: string) => void;
  removePhoto: (slot: string) => void;
  toggleDamageType: (type: string) => void;
  reset: () => void;
}

const initialState = {
  userId: "",
  currentStep: 1,
  make: "",
  makeSlug: "",
  model: "",
  year: "",
  trim: "",
  mileageKm: "",
  source: "" as const,
  accidentHistory: null,
  accidentDetails: "",
  serviceRecords: "" as const,
  numberOfKeys: "" as const,
  hasDamage: null,
  damageTypes: [] as string[],
  additionalNotes: "",
  photos: {} as Record<string, string>,
  sellingOption: "auction" as SellingOption,
  askingPrice: "",
  contactPreference: "WHATSAPP" as ContactPref,
};

export const useSellFormStore = create<SellFormState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

      updateField: (key, value) => set({ [key]: value }),

      setPhoto: (slot, url) =>
        set((s) => ({ photos: { ...s.photos, [slot]: url } })),

      removePhoto: (slot) =>
        set((s) => {
          const newPhotos = { ...s.photos };
          delete newPhotos[slot];
          return { photos: newPhotos };
        }),

      toggleDamageType: (type) =>
        set((s) => ({
          damageTypes: s.damageTypes.includes(type)
            ? s.damageTypes.filter((t) => t !== type)
            : [...s.damageTypes, type],
        })),

      reset: () => set(initialState),
    }),
    {
      name: "carsouk-sell-form-draft",
      partialize: (state) => ({
        userId: state.userId,
        currentStep: state.currentStep,
        make: state.make,
        makeSlug: state.makeSlug,
        model: state.model,
        year: state.year,
        trim: state.trim,
        mileageKm: state.mileageKm,
        source: state.source,
        accidentHistory: state.accidentHistory,
        accidentDetails: state.accidentDetails,
        serviceRecords: state.serviceRecords,
        numberOfKeys: state.numberOfKeys,
        hasDamage: state.hasDamage,
        damageTypes: state.damageTypes,
        additionalNotes: state.additionalNotes,
        photos: state.photos,
        sellingOption: state.sellingOption,
        askingPrice: state.askingPrice,
        contactPreference: state.contactPreference,
      }),
    }
  )
);
