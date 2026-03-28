"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "USD" | "LBP";

interface AppState {
  /** Current display currency. */
  currency: Currency;
  /** Toggle between USD and LBP. */
  toggleCurrency: () => void;
  /** Set a specific currency. */
  setCurrency: (currency: Currency) => void;

  /** Saved car IDs for the current user session. */
  savedCarIds: string[];
  /** Toggle a car's saved state. */
  toggleSavedCar: (carId: string) => void;
  /** Check if a car is saved. */
  isCarSaved: (carId: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currency: "USD",
      toggleCurrency: () =>
        set((state) => ({
          currency: state.currency === "USD" ? "LBP" : "USD",
        })),
      setCurrency: (currency) => set({ currency }),

      savedCarIds: [],
      toggleSavedCar: (carId) =>
        set((state) => ({
          savedCarIds: state.savedCarIds.includes(carId)
            ? state.savedCarIds.filter((id) => id !== carId)
            : [...state.savedCarIds, carId],
        })),
      isCarSaved: (carId) => get().savedCarIds.includes(carId),
    }),
    {
      name: "carsouk-app-store",
      partialize: (state) => ({
        currency: state.currency,
        savedCarIds: state.savedCarIds,
      }),
    }
  )
);
