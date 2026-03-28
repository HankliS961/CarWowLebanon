import { create } from "zustand";

interface AppState {
  /** Current currency display preference. */
  currency: "USD" | "LBP";
  /** Toggle currency display. */
  toggleCurrency: () => void;

  /** Mobile menu open state. */
  isMobileMenuOpen: boolean;
  /** Set mobile menu state. */
  setMobileMenuOpen: (open: boolean) => void;

  /** Search overlay open state. */
  isSearchOpen: boolean;
  /** Set search overlay state. */
  setSearchOpen: (open: boolean) => void;
}

/**
 * Global application state managed with Zustand.
 * Lightweight client state for UI preferences and toggles.
 */
export const useAppStore = create<AppState>((set) => ({
  currency: "USD",
  toggleCurrency: () =>
    set((state) => ({
      currency: state.currency === "USD" ? "LBP" : "USD",
    })),

  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
