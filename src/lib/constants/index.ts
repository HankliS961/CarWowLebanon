/** Lebanese regions with Arabic translations. */
export const REGIONS = [
  { value: "BEIRUT", labelEn: "Beirut", labelAr: "بيروت" },
  { value: "MOUNT_LEBANON", labelEn: "Mount Lebanon", labelAr: "جبل لبنان" },
  { value: "NORTH", labelEn: "North Lebanon", labelAr: "الشمال" },
  { value: "SOUTH", labelEn: "South Lebanon", labelAr: "الجنوب" },
  { value: "BEKAA", labelEn: "Bekaa", labelAr: "البقاع" },
  { value: "NABATIEH", labelEn: "Nabatieh", labelAr: "النبطية" },
] as const;

/** Body types with Arabic translations. */
export const BODY_TYPES = [
  { value: "SEDAN", labelEn: "Sedan", labelAr: "سيدان" },
  { value: "SUV", labelEn: "SUV", labelAr: "دفع رباعي" },
  { value: "HATCHBACK", labelEn: "Hatchback", labelAr: "هاتشباك" },
  { value: "PICKUP", labelEn: "Pickup", labelAr: "بيك أب" },
  { value: "COUPE", labelEn: "Coupe", labelAr: "كوبيه" },
  { value: "CONVERTIBLE", labelEn: "Convertible", labelAr: "مكشوفة" },
  { value: "VAN", labelEn: "Van", labelAr: "فان" },
  { value: "WAGON", labelEn: "Wagon", labelAr: "ستيشن" },
] as const;

/** Fuel types with Arabic translations. */
export const FUEL_TYPES = [
  { value: "GASOLINE", labelEn: "Gasoline", labelAr: "بنزين" },
  { value: "DIESEL", labelEn: "Diesel", labelAr: "ديزل" },
  { value: "HYBRID", labelEn: "Hybrid", labelAr: "هايبرد" },
  { value: "ELECTRIC", labelEn: "Electric", labelAr: "كهربائية" },
  { value: "PLUG_IN_HYBRID", labelEn: "Plug-in Hybrid", labelAr: "هايبرد قابل للشحن" },
] as const;

/** Transmission types with Arabic translations. */
export const TRANSMISSIONS = [
  { value: "AUTOMATIC", labelEn: "Automatic", labelAr: "أوتوماتيك" },
  { value: "MANUAL", labelEn: "Manual", labelAr: "عادي" },
  { value: "CVT", labelEn: "CVT", labelAr: "CVT" },
] as const;

/** Car conditions with Arabic translations. */
export const CAR_CONDITIONS = [
  { value: "NEW", labelEn: "New", labelAr: "جديدة" },
  { value: "USED", labelEn: "Used", labelAr: "مستعملة" },
  { value: "CERTIFIED_PREOWNED", labelEn: "Certified Pre-Owned", labelAr: "معتمدة مستعملة" },
] as const;

/** Car sources with Arabic translations. */
export const CAR_SOURCES = [
  { value: "LOCAL", labelEn: "Local", labelAr: "محلية" },
  { value: "IMPORTED_USA", labelEn: "Imported (USA)", labelAr: "مستوردة (أمريكا)" },
  { value: "IMPORTED_GULF", labelEn: "Imported (Gulf)", labelAr: "مستوردة (الخليج)" },
  { value: "IMPORTED_EUROPE", labelEn: "Imported (Europe)", labelAr: "مستوردة (أوروبا)" },
  { value: "SALVAGE_REBUILT", labelEn: "Salvage/Rebuilt", labelAr: "سالفج / إعادة بناء" },
] as const;

/** Pagination defaults. */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;

/** Approximate USD to LBP exchange rate (volatile — should be fetched dynamically). */
export const EXCHANGE_RATE_USD_LBP = 89500;
