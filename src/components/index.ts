/**
 * CarSouk Component Library — barrel exports.
 *
 * Usage:
 *   import { CarCard, DealerCard, PriceDisplay } from "@/components";
 */

// === Cars ===
export { CarCard } from "./cars/CarCard";
export type { CarCardProps } from "./cars/CarCard";
export { CarCardSkeleton } from "./cars/CarCardSkeleton";
export { FilterSidebar } from "./cars/FilterSidebar";
export type { FilterSidebarProps } from "./cars/FilterSidebar";
export { FilterSheet } from "./cars/FilterSheet";
export type { FilterSheetProps } from "./cars/FilterSheet";
export { StickyContactSidebar } from "./cars/StickyContactSidebar";
export type { StickyContactSidebarProps } from "./cars/StickyContactSidebar";

// === Dealers ===
export { DealerCard } from "./dealers/DealerCard";
export type { DealerCardProps } from "./dealers/DealerCard";

// === Forms ===
export { StepWizard } from "./forms/StepWizard";
export type { StepWizardProps, WizardStep } from "./forms/StepWizard";
export { PhotoUploader } from "./forms/PhotoUploader";
export type {
  PhotoUploaderProps,
  PhotoAngle,
  UploadedPhoto,
} from "./forms/PhotoUploader";

// === Layout ===
export { Header } from "./layout/Header";
export { Footer } from "./layout/Footer";
export { MegaMenu } from "./layout/MegaMenu";
export type { MegaMenuProps, MegaMenuItemConfig } from "./layout/MegaMenu";
export { MobileNav } from "./layout/MobileNav";

// === Shared ===
export { PriceDisplay } from "./shared/PriceDisplay";
export type { PriceDisplayProps } from "./shared/PriceDisplay";
export { ReviewRating } from "./shared/ReviewRating";
export type { ReviewRatingProps, CategoryRating } from "./shared/ReviewRating";
export { SpecsGrid } from "./shared/SpecsGrid";
export type { SpecsGridProps, SpecsData } from "./shared/SpecsGrid";
export { ProsCons } from "./shared/ProsCons";
export type { ProsConsProps } from "./shared/ProsCons";
export { WhatsAppButton } from "./shared/WhatsAppButton";
export type { WhatsAppButtonProps } from "./shared/WhatsAppButton";
export { LanguageToggle } from "./shared/LanguageToggle";
export { CurrencyToggle } from "./shared/CurrencyToggle";
export { TrustBar } from "./shared/TrustBar";
export type { TrustBarProps, TrustStat } from "./shared/TrustBar";
export { BreadcrumbNav } from "./shared/BreadcrumbNav";
export type { BreadcrumbNavProps, BreadcrumbItem } from "./shared/BreadcrumbNav";
export { TabNavigation } from "./shared/TabNavigation";
export type { TabNavigationProps, TabItem } from "./shared/TabNavigation";
export { OfferCard } from "./shared/OfferCard";
export type { OfferCardProps, OfferData, OfferBadge } from "./shared/OfferCard";
