import { PrismaClient, UserRole, Region, Language, CarCondition, CarSource, BodyType, FuelType, Transmission, Drivetrain, ListingStatus, ContentStatus, BlogCategory, DealerStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// CAR MAKES — Popular in Lebanon
// ---------------------------------------------------------------------------
const carMakes = [
  { nameEn: "Toyota", nameAr: "تويوتا", slug: "toyota", isPopular: true },
  { nameEn: "Kia", nameAr: "كيا", slug: "kia", isPopular: true },
  { nameEn: "Hyundai", nameAr: "هيونداي", slug: "hyundai", isPopular: true },
  { nameEn: "Mercedes-Benz", nameAr: "مرسيدس بنز", slug: "mercedes-benz", isPopular: true },
  { nameEn: "BMW", nameAr: "بي إم دبليو", slug: "bmw", isPopular: true },
  { nameEn: "Nissan", nameAr: "نيسان", slug: "nissan", isPopular: true },
  { nameEn: "Honda", nameAr: "هوندا", slug: "honda", isPopular: true },
  { nameEn: "Land Rover", nameAr: "لاند روفر", slug: "land-rover", isPopular: true },
  { nameEn: "BYD", nameAr: "بي واي دي", slug: "byd", isPopular: true },
  { nameEn: "Chery", nameAr: "شيري", slug: "chery", isPopular: false },
  { nameEn: "MG", nameAr: "إم جي", slug: "mg", isPopular: false },
  { nameEn: "Mitsubishi", nameAr: "ميتسوبيشي", slug: "mitsubishi", isPopular: false },
  { nameEn: "Suzuki", nameAr: "سوزوكي", slug: "suzuki", isPopular: false },
  { nameEn: "Volkswagen", nameAr: "فولكس واجن", slug: "volkswagen", isPopular: false },
  { nameEn: "Audi", nameAr: "أودي", slug: "audi", isPopular: true },
  { nameEn: "Porsche", nameAr: "بورشه", slug: "porsche", isPopular: false },
  { nameEn: "Ford", nameAr: "فورد", slug: "ford", isPopular: false },
  { nameEn: "Chevrolet", nameAr: "شيفروليه", slug: "chevrolet", isPopular: false },
  { nameEn: "Jeep", nameAr: "جيب", slug: "jeep", isPopular: false },
  { nameEn: "Mazda", nameAr: "مازدا", slug: "mazda", isPopular: false },
  { nameEn: "Lexus", nameAr: "لكزس", slug: "lexus", isPopular: false },
  { nameEn: "Infiniti", nameAr: "إنفينيتي", slug: "infiniti", isPopular: false },
  { nameEn: "GMC", nameAr: "جي إم سي", slug: "gmc", isPopular: false },
  { nameEn: "Cadillac", nameAr: "كاديلاك", slug: "cadillac", isPopular: false },
  { nameEn: "Lincoln", nameAr: "لينكولن", slug: "lincoln", isPopular: false },
  { nameEn: "Genesis", nameAr: "جينيسيس", slug: "genesis", isPopular: false },
  { nameEn: "Geely", nameAr: "جيلي", slug: "geely", isPopular: false },
  { nameEn: "Haval", nameAr: "هافال", slug: "haval", isPopular: false },
  { nameEn: "Changan", nameAr: "شانجان", slug: "changan", isPopular: false },
  { nameEn: "Subaru", nameAr: "سوبارو", slug: "subaru", isPopular: false },
];

// ---------------------------------------------------------------------------
// CAR MODELS — Top models per make
// ---------------------------------------------------------------------------
interface ModelSeed {
  makeSlug: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  bodyType?: BodyType;
  yearsAvailable?: number[];
}

const carModels: ModelSeed[] = [
  // Toyota
  { makeSlug: "toyota", nameEn: "Camry", nameAr: "كامري", slug: "camry", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "toyota", nameEn: "Corolla", nameAr: "كورولا", slug: "corolla", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "toyota", nameEn: "RAV4", nameAr: "راف فور", slug: "rav4", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "toyota", nameEn: "Land Cruiser", nameAr: "لاند كروزر", slug: "land-cruiser", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "toyota", nameEn: "Yaris", nameAr: "ياريس", slug: "yaris", bodyType: BodyType.HATCHBACK, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "toyota", nameEn: "Hilux", nameAr: "هايلكس", slug: "hilux", bodyType: BodyType.PICKUP, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Kia
  { makeSlug: "kia", nameEn: "Sportage", nameAr: "سبورتاج", slug: "sportage", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "kia", nameEn: "Cerato", nameAr: "سيراتو", slug: "cerato", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "kia", nameEn: "Sorento", nameAr: "سورينتو", slug: "sorento", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "kia", nameEn: "Picanto", nameAr: "بيكانتو", slug: "picanto", bodyType: BodyType.HATCHBACK, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "kia", nameEn: "K5", nameAr: "كي 5", slug: "k5", bodyType: BodyType.SEDAN, yearsAvailable: [2021, 2022, 2023, 2024, 2025] },
  // Hyundai
  { makeSlug: "hyundai", nameEn: "Tucson", nameAr: "توسان", slug: "tucson", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "hyundai", nameEn: "Elantra", nameAr: "إلنترا", slug: "elantra", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "hyundai", nameEn: "Creta", nameAr: "كريتا", slug: "creta", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "hyundai", nameEn: "Accent", nameAr: "أكسنت", slug: "accent", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "hyundai", nameEn: "Santa Fe", nameAr: "سانتا في", slug: "santa-fe", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Mercedes-Benz
  { makeSlug: "mercedes-benz", nameEn: "C-Class", nameAr: "الفئة سي", slug: "c-class", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "mercedes-benz", nameEn: "E-Class", nameAr: "الفئة إي", slug: "e-class", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "mercedes-benz", nameEn: "GLC", nameAr: "جي إل سي", slug: "glc", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "mercedes-benz", nameEn: "GLE", nameAr: "جي إل إي", slug: "gle", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "mercedes-benz", nameEn: "A-Class", nameAr: "الفئة إيه", slug: "a-class", bodyType: BodyType.HATCHBACK, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  // BMW
  { makeSlug: "bmw", nameEn: "3 Series", nameAr: "الفئة 3", slug: "3-series", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "bmw", nameEn: "5 Series", nameAr: "الفئة 5", slug: "5-series", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "bmw", nameEn: "X3", nameAr: "إكس 3", slug: "x3", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "bmw", nameEn: "X5", nameAr: "إكس 5", slug: "x5", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "bmw", nameEn: "X1", nameAr: "إكس 1", slug: "x1", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Nissan
  { makeSlug: "nissan", nameEn: "Patrol", nameAr: "باترول", slug: "patrol", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "nissan", nameEn: "X-Trail", nameAr: "إكس تريل", slug: "x-trail", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "nissan", nameEn: "Sunny", nameAr: "صني", slug: "sunny", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "nissan", nameEn: "Kicks", nameAr: "كيكس", slug: "kicks", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Honda
  { makeSlug: "honda", nameEn: "Civic", nameAr: "سيفيك", slug: "civic", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "honda", nameEn: "CR-V", nameAr: "سي آر في", slug: "cr-v", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "honda", nameEn: "Accord", nameAr: "أكورد", slug: "accord", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "honda", nameEn: "HR-V", nameAr: "إتش آر في", slug: "hr-v", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Land Rover
  { makeSlug: "land-rover", nameEn: "Range Rover", nameAr: "رانج روفر", slug: "range-rover", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "land-rover", nameEn: "Range Rover Sport", nameAr: "رانج روفر سبورت", slug: "range-rover-sport", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "land-rover", nameEn: "Defender", nameAr: "ديفندر", slug: "defender", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "land-rover", nameEn: "Discovery", nameAr: "ديسكفري", slug: "discovery", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  // BYD
  { makeSlug: "byd", nameEn: "Atto 3", nameAr: "أتو 3", slug: "atto-3", bodyType: BodyType.SUV, yearsAvailable: [2023, 2024, 2025] },
  { makeSlug: "byd", nameEn: "Seal", nameAr: "سيل", slug: "seal", bodyType: BodyType.SEDAN, yearsAvailable: [2023, 2024, 2025] },
  { makeSlug: "byd", nameEn: "Song Plus", nameAr: "سونج بلس", slug: "song-plus", bodyType: BodyType.SUV, yearsAvailable: [2023, 2024, 2025] },
  // Chery
  { makeSlug: "chery", nameEn: "Tiggo 7 Pro", nameAr: "تيجو 7 برو", slug: "tiggo-7-pro", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024, 2025] },
  { makeSlug: "chery", nameEn: "Tiggo 8 Pro", nameAr: "تيجو 8 برو", slug: "tiggo-8-pro", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024, 2025] },
  { makeSlug: "chery", nameEn: "Arrizo 5", nameAr: "أريزو 5", slug: "arrizo-5", bodyType: BodyType.SEDAN, yearsAvailable: [2022, 2023, 2024] },
  // MG
  { makeSlug: "mg", nameEn: "ZS", nameAr: "زد إس", slug: "zs", bodyType: BodyType.SUV, yearsAvailable: [2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "mg", nameEn: "RX5", nameAr: "آر إكس 5", slug: "rx5", bodyType: BodyType.SUV, yearsAvailable: [2021, 2022, 2023, 2024] },
  { makeSlug: "mg", nameEn: "MG5", nameAr: "إم جي 5", slug: "mg5", bodyType: BodyType.SEDAN, yearsAvailable: [2021, 2022, 2023, 2024] },
  // Mitsubishi
  { makeSlug: "mitsubishi", nameEn: "Outlander", nameAr: "أوتلاندر", slug: "outlander", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "mitsubishi", nameEn: "Pajero", nameAr: "باجيرو", slug: "pajero", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022] },
  { makeSlug: "mitsubishi", nameEn: "L200", nameAr: "إل 200", slug: "l200", bodyType: BodyType.PICKUP, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  // Suzuki
  { makeSlug: "suzuki", nameEn: "Swift", nameAr: "سويفت", slug: "swift", bodyType: BodyType.HATCHBACK, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "suzuki", nameEn: "Vitara", nameAr: "فيتارا", slug: "vitara", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "suzuki", nameEn: "Jimny", nameAr: "جيمني", slug: "jimny", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Volkswagen
  { makeSlug: "volkswagen", nameEn: "Golf", nameAr: "غولف", slug: "golf", bodyType: BodyType.HATCHBACK, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "volkswagen", nameEn: "Tiguan", nameAr: "تيجوان", slug: "tiguan", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "volkswagen", nameEn: "Passat", nameAr: "باسات", slug: "passat", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  // Audi
  { makeSlug: "audi", nameEn: "A4", nameAr: "إيه 4", slug: "a4", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "audi", nameEn: "Q5", nameAr: "كيو 5", slug: "q5", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "audi", nameEn: "A6", nameAr: "إيه 6", slug: "a6", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "audi", nameEn: "Q7", nameAr: "كيو 7", slug: "q7", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Porsche
  { makeSlug: "porsche", nameEn: "Cayenne", nameAr: "كايين", slug: "cayenne", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "porsche", nameEn: "Macan", nameAr: "ماكان", slug: "macan", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "porsche", nameEn: "911", nameAr: "911", slug: "911", bodyType: BodyType.COUPE, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Ford
  { makeSlug: "ford", nameEn: "Explorer", nameAr: "إكسبلورر", slug: "explorer", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "ford", nameEn: "F-150", nameAr: "إف 150", slug: "f-150", bodyType: BodyType.PICKUP, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "ford", nameEn: "Mustang", nameAr: "موستنج", slug: "mustang", bodyType: BodyType.COUPE, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Chevrolet
  { makeSlug: "chevrolet", nameEn: "Tahoe", nameAr: "تاهو", slug: "tahoe", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "chevrolet", nameEn: "Camaro", nameAr: "كامارو", slug: "camaro", bodyType: BodyType.COUPE, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "chevrolet", nameEn: "Silverado", nameAr: "سيلفرادو", slug: "silverado", bodyType: BodyType.PICKUP, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Jeep
  { makeSlug: "jeep", nameEn: "Wrangler", nameAr: "رانجلر", slug: "wrangler", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "jeep", nameEn: "Grand Cherokee", nameAr: "جراند شيروكي", slug: "grand-cherokee", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "jeep", nameEn: "Compass", nameAr: "كومباس", slug: "compass", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  // Mazda
  { makeSlug: "mazda", nameEn: "CX-5", nameAr: "سي إكس 5", slug: "cx-5", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "mazda", nameEn: "Mazda3", nameAr: "مازدا 3", slug: "mazda3", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "mazda", nameEn: "CX-9", nameAr: "سي إكس 9", slug: "cx-9", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  // Lexus
  { makeSlug: "lexus", nameEn: "RX", nameAr: "آر إكس", slug: "rx", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "lexus", nameEn: "ES", nameAr: "إي إس", slug: "es", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "lexus", nameEn: "NX", nameAr: "إن إكس", slug: "nx", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Geely
  { makeSlug: "geely", nameEn: "Coolray", nameAr: "كول راي", slug: "coolray", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024, 2025] },
  { makeSlug: "geely", nameEn: "Emgrand", nameAr: "إمجراند", slug: "emgrand", bodyType: BodyType.SEDAN, yearsAvailable: [2022, 2023, 2024] },
  { makeSlug: "geely", nameEn: "Azkarra", nameAr: "أزكارا", slug: "azkarra", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024] },
  // Haval
  { makeSlug: "haval", nameEn: "H6", nameAr: "إتش 6", slug: "h6", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024, 2025] },
  { makeSlug: "haval", nameEn: "Jolion", nameAr: "جوليون", slug: "jolion", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024, 2025] },
  // Changan
  { makeSlug: "changan", nameEn: "CS75 Plus", nameAr: "سي إس 75 بلس", slug: "cs75-plus", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024, 2025] },
  { makeSlug: "changan", nameEn: "Alsvin", nameAr: "ألسفين", slug: "alsvin", bodyType: BodyType.SEDAN, yearsAvailable: [2022, 2023, 2024] },
  // GMC
  { makeSlug: "gmc", nameEn: "Yukon", nameAr: "يوكون", slug: "yukon", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "gmc", nameEn: "Sierra", nameAr: "سييرا", slug: "sierra", bodyType: BodyType.PICKUP, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  // Infiniti
  { makeSlug: "infiniti", nameEn: "QX60", nameAr: "كيو إكس 60", slug: "qx60", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  { makeSlug: "infiniti", nameEn: "Q50", nameAr: "كيو 50", slug: "q50", bodyType: BodyType.SEDAN, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
  // Genesis
  { makeSlug: "genesis", nameEn: "GV70", nameAr: "جي في 70", slug: "gv70", bodyType: BodyType.SUV, yearsAvailable: [2022, 2023, 2024, 2025] },
  { makeSlug: "genesis", nameEn: "G80", nameAr: "جي 80", slug: "g80", bodyType: BodyType.SEDAN, yearsAvailable: [2022, 2023, 2024, 2025] },
  // Subaru
  { makeSlug: "subaru", nameEn: "Forester", nameAr: "فورستر", slug: "forester", bodyType: BodyType.SUV, yearsAvailable: [2020, 2021, 2022, 2023, 2024, 2025] },
  { makeSlug: "subaru", nameEn: "Outback", nameAr: "أوتباك", slug: "outback", bodyType: BodyType.WAGON, yearsAvailable: [2020, 2021, 2022, 2023, 2024] },
];

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding CarSouk database...\n");

  // --- Car Makes ---
  console.log("Seeding car makes...");
  const makeMap = new Map<string, number>();
  for (const make of carMakes) {
    const result = await prisma.carMake.upsert({
      where: { slug: make.slug },
      update: { nameEn: make.nameEn, nameAr: make.nameAr, isPopular: make.isPopular },
      create: make,
    });
    makeMap.set(make.slug, result.id);
  }
  console.log(`  Created/updated ${carMakes.length} car makes.`);

  // --- Car Models ---
  console.log("Seeding car models...");
  let modelCount = 0;
  for (const model of carModels) {
    const makeId = makeMap.get(model.makeSlug);
    if (!makeId) {
      console.warn(`  Skipping model ${model.nameEn}: make ${model.makeSlug} not found.`);
      continue;
    }
    // Use a combination of makeId and slug for upsert since CarModel has no unique slug alone
    const existing = await prisma.carModel.findFirst({
      where: { makeId, slug: model.slug },
    });
    if (existing) {
      await prisma.carModel.update({
        where: { id: existing.id },
        data: {
          nameEn: model.nameEn,
          nameAr: model.nameAr,
          bodyType: model.bodyType,
          yearsAvailable: model.yearsAvailable,
        },
      });
    } else {
      await prisma.carModel.create({
        data: {
          makeId,
          nameEn: model.nameEn,
          nameAr: model.nameAr,
          slug: model.slug,
          bodyType: model.bodyType,
          yearsAvailable: model.yearsAvailable,
        },
      });
    }
    modelCount++;
  }
  console.log(`  Created/updated ${modelCount} car models.`);

  // --- Admin User ---
  console.log("Seeding admin user...");
  const adminPasswordHash = await hash("Admin123!", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@carsouk.com" },
    update: {},
    create: {
      email: "admin@carsouk.com",
      name: "CarSouk Admin",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      languagePref: Language.EN,
    },
  });
  console.log(`  Admin user: ${adminUser.email}`);

  // --- Dealer Users ---
  console.log("Seeding dealer users...");
  const dealerPassword = await hash("Dealer123!", 12);

  const dealerUser1 = await prisma.user.upsert({
    where: { email: "beirut.motors@example.com" },
    update: {},
    create: {
      email: "beirut.motors@example.com",
      name: "Ahmad Khoury",
      passwordHash: dealerPassword,
      role: UserRole.DEALER,
      isVerified: true,
      locationRegion: Region.BEIRUT,
      languagePref: Language.AR,
    },
  });

  const dealerUser2 = await prisma.user.upsert({
    where: { email: "mount.lebanon.auto@example.com" },
    update: {},
    create: {
      email: "mount.lebanon.auto@example.com",
      name: "Rami Haddad",
      passwordHash: dealerPassword,
      role: UserRole.DEALER,
      isVerified: true,
      locationRegion: Region.MOUNT_LEBANON,
      languagePref: Language.AR,
    },
  });

  // --- Dealer Profiles ---
  console.log("Seeding dealer profiles...");
  const dealer1 = await prisma.dealer.upsert({
    where: { userId: dealerUser1.id },
    update: {},
    create: {
      userId: dealerUser1.id,
      companyName: "Beirut Premium Motors",
      companyNameAr: "بيروت بريميوم موتورز",
      slug: "beirut-premium-motors",
      descriptionEn: "Premier car dealership in the heart of Beirut specializing in luxury and performance vehicles. Authorized dealer for multiple brands with over 15 years of experience.",
      descriptionAr: "وكالة سيارات متميزة في قلب بيروت متخصصة في السيارات الفاخرة وسيارات الأداء. وكيل معتمد لعلامات تجارية متعددة مع خبرة تفوق 15 عاماً.",
      region: Region.BEIRUT,
      city: "Beirut",
      phone: "+961-1-234567",
      whatsappNumber: "9611234567",
      email: "info@beirutpremium.com",
      address: "Sin El Fil, Beirut",
      isVerified: true,
      status: DealerStatus.ACTIVE,
      brandsCarried: ["Mercedes-Benz", "BMW", "Audi", "Porsche", "Land Rover"],
      workingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "14:00" },
        sunday: null,
      },
    },
  });

  const dealer2 = await prisma.dealer.upsert({
    where: { userId: dealerUser2.id },
    update: {},
    create: {
      userId: dealerUser2.id,
      companyName: "Mount Lebanon Auto Center",
      companyNameAr: "مركز جبل لبنان للسيارات",
      slug: "mount-lebanon-auto-center",
      descriptionEn: "Family-owned auto center in Jounieh offering a wide selection of Japanese and Korean vehicles. Known for competitive pricing and excellent after-sale service.",
      descriptionAr: "مركز سيارات عائلي في جونية يقدم مجموعة واسعة من السيارات اليابانية والكورية. معروف بالأسعار التنافسية وخدمة ما بعد البيع الممتازة.",
      region: Region.MOUNT_LEBANON,
      city: "Jounieh",
      phone: "+961-9-876543",
      whatsappNumber: "9619876543",
      email: "info@mtlebautocenter.com",
      address: "Jounieh Highway, Mount Lebanon",
      isVerified: true,
      status: DealerStatus.ACTIVE,
      brandsCarried: ["Toyota", "Honda", "Hyundai", "Kia", "Nissan"],
      workingHours: {
        monday: { open: "08:30", close: "18:30" },
        tuesday: { open: "08:30", close: "18:30" },
        wednesday: { open: "08:30", close: "18:30" },
        thursday: { open: "08:30", close: "18:30" },
        friday: { open: "08:30", close: "18:30" },
        saturday: { open: "09:00", close: "15:00" },
        sunday: null,
      },
    },
  });

  // --- Buyer Users ---
  console.log("Seeding buyer users...");
  const buyerPassword = await hash("Buyer123!", 12);

  const buyer1 = await prisma.user.upsert({
    where: { email: "sara@example.com" },
    update: {},
    create: {
      email: "sara@example.com",
      name: "Sara Nassar",
      phone: "+961701234567",
      passwordHash: buyerPassword,
      role: UserRole.BUYER,
      isVerified: true,
      locationRegion: Region.BEIRUT,
      languagePref: Language.AR,
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      email: "mike@example.com",
      name: "Mike Chamoun",
      phone: "+961709876543",
      passwordHash: buyerPassword,
      role: UserRole.BUYER,
      isVerified: true,
      locationRegion: Region.MOUNT_LEBANON,
      languagePref: Language.EN,
    },
  });
  console.log(`  Buyer 1: ${buyer1.email}`);
  console.log(`  Buyer 2: ${buyer2.email}`);

  // --- Sample Car Listings ---
  console.log("Seeding car listings...");
  const sampleCars = [
    {
      dealerId: dealer1.id,
      status: ListingStatus.ACTIVE,
      condition: CarCondition.NEW,
      source: CarSource.LOCAL,
      make: "Mercedes-Benz",
      model: "C-Class",
      year: 2024,
      trim: "C200 AMG Line",
      bodyType: BodyType.SEDAN,
      mileageKm: 0,
      fuelType: FuelType.GASOLINE,
      transmission: Transmission.AUTOMATIC,
      drivetrain: Drivetrain.RWD,
      engineSize: "1.5L Turbo",
      horsepower: 204,
      colorExterior: "Obsidian Black",
      descriptionEn: "Brand new 2024 Mercedes-Benz C200 AMG Line. Full factory warranty. Panoramic sunroof, Burmester sound system, and AMG body kit included.",
      descriptionAr: "مرسيدس بنز C200 AMG لاين 2024 جديدة كلياً. ضمان المصنع الكامل. سقف بانورامي، نظام صوت بورميستر، وطقم AMG الرياضي.",
      priceUsd: 62000,
      isNegotiable: false,
      isFeatured: true,
      locationRegion: Region.BEIRUT,
      locationCity: "Beirut",
      features: ["Panoramic Sunroof", "Burmester Sound", "AMG Body Kit", "360 Camera", "Ambient Lighting"],
      images: [],
      customsPaid: true,
    },
    {
      dealerId: dealer1.id,
      status: ListingStatus.ACTIVE,
      condition: CarCondition.USED,
      source: CarSource.IMPORTED_GULF,
      make: "BMW",
      model: "X5",
      year: 2022,
      trim: "xDrive40i M Sport",
      bodyType: BodyType.SUV,
      mileageKm: 35000,
      fuelType: FuelType.GASOLINE,
      transmission: Transmission.AUTOMATIC,
      drivetrain: Drivetrain.AWD,
      engineSize: "3.0L Turbo I6",
      horsepower: 340,
      colorExterior: "Alpine White",
      descriptionEn: "Immaculate 2022 BMW X5 xDrive40i M Sport imported from the Gulf. Full option with M Sport package. Service history available.",
      descriptionAr: "BMW X5 xDrive40i M سبورت 2022 بحالة ممتازة مستوردة من الخليج. فل أوبشن مع حزمة M سبورت. سجل الصيانة متوفر.",
      priceUsd: 75000,
      isNegotiable: true,
      isFeatured: true,
      locationRegion: Region.BEIRUT,
      locationCity: "Beirut",
      features: ["M Sport Package", "Heads-Up Display", "Harman Kardon", "Gesture Control", "Soft Close Doors"],
      images: [],
      customsPaid: true,
      accidentHistory: false,
    },
    {
      dealerId: dealer2.id,
      status: ListingStatus.ACTIVE,
      condition: CarCondition.NEW,
      source: CarSource.LOCAL,
      make: "Toyota",
      model: "Corolla",
      year: 2024,
      trim: "XLi",
      bodyType: BodyType.SEDAN,
      mileageKm: 0,
      fuelType: FuelType.GASOLINE,
      transmission: Transmission.CVT,
      drivetrain: Drivetrain.FWD,
      engineSize: "1.6L",
      horsepower: 120,
      colorExterior: "Silver Metallic",
      descriptionEn: "New 2024 Toyota Corolla XLi. Reliable, fuel-efficient, and perfect for daily commuting in Lebanon.",
      descriptionAr: "تويوتا كورولا XLi 2024 جديدة. موثوقة، اقتصادية في استهلاك الوقود، ومثالية للتنقل اليومي في لبنان.",
      priceUsd: 22500,
      isNegotiable: true,
      isFeatured: false,
      locationRegion: Region.MOUNT_LEBANON,
      locationCity: "Jounieh",
      features: ["Apple CarPlay", "Android Auto", "Lane Assist", "Adaptive Cruise Control"],
      images: [],
      customsPaid: true,
    },
    {
      dealerId: dealer2.id,
      status: ListingStatus.ACTIVE,
      condition: CarCondition.USED,
      source: CarSource.IMPORTED_USA,
      make: "Hyundai",
      model: "Tucson",
      year: 2023,
      trim: "SEL",
      bodyType: BodyType.SUV,
      mileageKm: 18000,
      fuelType: FuelType.GASOLINE,
      transmission: Transmission.AUTOMATIC,
      drivetrain: Drivetrain.AWD,
      engineSize: "2.5L",
      horsepower: 187,
      colorExterior: "Amazon Gray",
      descriptionEn: "2023 Hyundai Tucson SEL imported from the USA. Clean title, no accidents. Excellent condition with low mileage.",
      descriptionAr: "هيونداي توسان SEL 2023 مستوردة من أمريكا. سجل نظيف بدون حوادث. حالة ممتازة مع كيلومتراج منخفض.",
      priceUsd: 29000,
      isNegotiable: true,
      isFeatured: false,
      locationRegion: Region.MOUNT_LEBANON,
      locationCity: "Jounieh",
      features: ["Blind Spot Monitor", "Apple CarPlay", "Heated Seats", "Wireless Charging"],
      images: [],
      customsPaid: true,
      accidentHistory: false,
    },
    {
      dealerId: dealer1.id,
      status: ListingStatus.ACTIVE,
      condition: CarCondition.USED,
      source: CarSource.SALVAGE_REBUILT,
      make: "Land Rover",
      model: "Range Rover Sport",
      year: 2021,
      trim: "HSE Dynamic",
      bodyType: BodyType.SUV,
      mileageKm: 45000,
      fuelType: FuelType.GASOLINE,
      transmission: Transmission.AUTOMATIC,
      drivetrain: Drivetrain.AWD,
      engineSize: "3.0L Supercharged V6",
      horsepower: 395,
      colorExterior: "Carpathian Grey",
      descriptionEn: "2021 Range Rover Sport HSE Dynamic. Rebuilt title from the US. Professionally repaired with full documentation. Exceptional value.",
      descriptionAr: "رانج روفر سبورت HSE دايناميك 2021. سجل إعادة بناء من أمريكا. تم إصلاحها باحتراف مع توثيق كامل. قيمة استثنائية.",
      priceUsd: 58000,
      originalPriceUsd: 85000,
      isNegotiable: true,
      isFeatured: true,
      locationRegion: Region.BEIRUT,
      locationCity: "Beirut",
      features: ["Meridian Sound", "Panoramic Roof", "Terrain Response 2", "Pixel LED Headlights", "Air Suspension"],
      images: [],
      customsPaid: false,
      accidentHistory: true,
    },
  ];

  const createdCars = [];
  for (const car of sampleCars) {
    const c = await prisma.car.create({ data: car });
    createdCars.push(c);
  }
  console.log(`  Created ${sampleCars.length} car listings.`);

  // --- More Cars (variety for new/used pages) ---
  console.log("Seeding additional car listings...");
  const moreCars = [
    {
      dealerId: dealer2.id, status: ListingStatus.ACTIVE, condition: CarCondition.NEW, source: CarSource.LOCAL,
      make: "Kia", model: "Sportage", year: 2025, trim: "GT-Line", bodyType: BodyType.SUV,
      mileageKm: 0, fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD,
      engineSize: "1.6L Turbo", horsepower: 180, colorExterior: "Runway Red",
      descriptionEn: "All-new 2025 Kia Sportage GT-Line. Bold design with cutting-edge technology.", descriptionAr: "كيا سبورتاج GT-لاين 2025 الجديدة كلياً. تصميم جريء مع تقنية متطورة.",
      priceUsd: 32000, isNegotiable: true, isFeatured: false, locationRegion: Region.MOUNT_LEBANON, locationCity: "Jounieh",
      features: ["Dual Panoramic Display", "Remote Parking", "Highway Driving Assist"], images: [], customsPaid: true,
    },
    {
      dealerId: dealer2.id, status: ListingStatus.ACTIVE, condition: CarCondition.NEW, source: CarSource.LOCAL,
      make: "Honda", model: "Civic", year: 2024, trim: "RS", bodyType: BodyType.SEDAN,
      mileageKm: 0, fuelType: FuelType.GASOLINE, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD,
      engineSize: "1.5L Turbo", horsepower: 182, colorExterior: "Platinum White Pearl",
      descriptionEn: "2024 Honda Civic RS Turbo. Sporty, efficient, and packed with tech.", descriptionAr: "هوندا سيفيك RS تيربو 2024. رياضية واقتصادية ومليئة بالتقنيات.",
      priceUsd: 28000, isNegotiable: false, isFeatured: false, locationRegion: Region.MOUNT_LEBANON, locationCity: "Jounieh",
      features: ["Honda Sensing", "Bose Sound", "Wireless CarPlay"], images: [], customsPaid: true,
    },
    {
      dealerId: dealer1.id, status: ListingStatus.ACTIVE, condition: CarCondition.NEW, source: CarSource.LOCAL,
      make: "BYD", model: "Atto 3", year: 2025, trim: "Extended Range", bodyType: BodyType.SUV,
      mileageKm: 0, fuelType: FuelType.ELECTRIC, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD,
      engineSize: "Electric", horsepower: 204, colorExterior: "Ski White",
      descriptionEn: "2025 BYD Atto 3 Electric. Zero emissions, 420km range, and loaded with features.", descriptionAr: "بي واي دي أتو 3 كهربائية 2025. صفر انبعاثات، مدى 420 كم، ومحملة بالميزات.",
      priceUsd: 35000, isNegotiable: true, isFeatured: true, locationRegion: Region.BEIRUT, locationCity: "Beirut",
      features: ["420km Range", "V2L", "Rotating Touchscreen", "NFC Key"], images: [], customsPaid: true,
    },
    {
      dealerId: dealer1.id, status: ListingStatus.ACTIVE, condition: CarCondition.USED, source: CarSource.IMPORTED_GULF,
      make: "Toyota", model: "Land Cruiser", year: 2023, trim: "VXR", bodyType: BodyType.SUV,
      mileageKm: 28000, fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FOUR_WD,
      engineSize: "3.5L Twin Turbo V6", horsepower: 409, colorExterior: "Pearl White",
      descriptionEn: "2023 Toyota Land Cruiser VXR imported from Dubai. Fully loaded with GCC specs.", descriptionAr: "تويوتا لاند كروزر VXR 2023 مستوردة من دبي. فل أوبشن مواصفات خليجية.",
      priceUsd: 95000, isNegotiable: true, isFeatured: true, locationRegion: Region.BEIRUT, locationCity: "Beirut",
      features: ["Crawl Control", "Multi-Terrain Select", "JBL Sound", "Rear Entertainment"], images: [], customsPaid: true, accidentHistory: false,
    },
    {
      dealerId: dealer2.id, status: ListingStatus.ACTIVE, condition: CarCondition.USED, source: CarSource.IMPORTED_USA,
      make: "Kia", model: "K5", year: 2023, trim: "GT", bodyType: BodyType.SEDAN,
      mileageKm: 22000, fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD,
      engineSize: "2.5L Turbo", horsepower: 290, colorExterior: "Wolf Gray",
      descriptionEn: "2023 Kia K5 GT from the USA. Clean title, powerful turbo engine. A real sleeper sedan.", descriptionAr: "كيا K5 GT 2023 من أمريكا. سجل نظيف، محرك تيربو قوي.",
      priceUsd: 26000, isNegotiable: true, isFeatured: false, locationRegion: Region.MOUNT_LEBANON, locationCity: "Jounieh",
      features: ["GT Sport Seats", "Launch Control", "Bose Audio", "360 Camera"], images: [], customsPaid: true, accidentHistory: false,
    },
    {
      dealerId: dealer1.id, status: ListingStatus.ACTIVE, condition: CarCondition.USED, source: CarSource.LOCAL,
      make: "Audi", model: "Q5", year: 2022, trim: "Premium Plus", bodyType: BodyType.SUV,
      mileageKm: 40000, fuelType: FuelType.GASOLINE, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD,
      engineSize: "2.0L Turbo", horsepower: 261, colorExterior: "Navarra Blue",
      descriptionEn: "2022 Audi Q5 Premium Plus. Local car, full service history at dealer. Excellent condition.", descriptionAr: "أودي Q5 بريميوم بلس 2022. سيارة محلية، سجل صيانة كامل عند الوكيل. حالة ممتازة.",
      priceUsd: 48000, isNegotiable: true, isFeatured: false, locationRegion: Region.BEIRUT, locationCity: "Beirut",
      features: ["Virtual Cockpit", "Bang & Olufsen", "Matrix LED", "Adaptive Air Suspension"], images: [], customsPaid: true, accidentHistory: false,
    },
    {
      dealerId: dealer2.id, status: ListingStatus.ACTIVE, condition: CarCondition.NEW, source: CarSource.LOCAL,
      make: "Hyundai", model: "Tucson", year: 2025, trim: "Limited", bodyType: BodyType.SUV,
      mileageKm: 0, fuelType: FuelType.HYBRID, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD,
      engineSize: "1.6L Turbo Hybrid", horsepower: 230, colorExterior: "Amazon Gray",
      descriptionEn: "2025 Hyundai Tucson Limited Hybrid. Best-in-class fuel economy with premium features.", descriptionAr: "هيونداي توسان ليمتد هايبرد 2025. أفضل اقتصادية في فئتها مع ميزات فاخرة.",
      priceUsd: 36000, isNegotiable: false, isFeatured: false, locationRegion: Region.MOUNT_LEBANON, locationCity: "Jounieh",
      features: ["Hybrid Powertrain", "BOSE Premium Audio", "Blind Spot View Monitor", "Remote Smart Park"], images: [], customsPaid: true,
    },
  ];

  for (const car of moreCars) {
    await prisma.car.create({ data: car });
  }
  console.log(`  Created ${moreCars.length} additional car listings.`);

  // --- Sample Inquiries ---
  console.log("Seeding sample inquiries...");
  if (createdCars[0]) {
    await prisma.inquiry.create({
      data: {
        carId: createdCars[0].id,
        buyerId: buyer1.id,
        dealerId: dealer1.id,
        message: "Hi, is this car still available? Can I schedule a test drive this weekend?",
        preferredContact: "WHATSAPP",
        status: "NEW",
      },
    });
  }
  if (createdCars[2]) {
    await prisma.inquiry.create({
      data: {
        carId: createdCars[2].id,
        buyerId: buyer2.id,
        dealerId: dealer2.id,
        message: "What's the best price you can offer? I'm looking to buy this week.",
        preferredContact: "CALL",
        status: "NEW",
      },
    });
  }
  console.log("  Created sample inquiries.");

  // --- Sample Notifications ---
  console.log("Seeding sample notifications...");
  await prisma.notification.createMany({
    data: [
      { userId: buyer1.id, type: "NEW_INQUIRY", title: "Inquiry Sent", body: "Your inquiry about the Mercedes C-Class has been sent to Beirut Premium Motors.", isRead: false },
      { userId: buyer1.id, type: "LISTING_MATCH", title: "New Listing Match", body: "A new Toyota Land Cruiser matching your search was just listed!", isRead: false },
      { userId: dealerUser1.id, type: "NEW_INQUIRY", title: "New Inquiry", body: "Sara Nassar is interested in your Mercedes-Benz C-Class 2024.", isRead: false },
      { userId: dealerUser2.id, type: "NEW_INQUIRY", title: "New Inquiry", body: "Mike Chamoun is interested in your Toyota Corolla 2024.", isRead: false },
    ],
  });
  console.log("  Created sample notifications.");

  // --- Blog Posts ---
  console.log("Seeding blog posts...");
  await prisma.blogPost.upsert({
    where: { slug: "guide-importing-car-lebanon-2024" },
    update: {},
    create: {
      slug: "guide-importing-car-lebanon-2024",
      titleEn: "Complete Guide to Importing a Car to Lebanon in 2024",
      titleAr: "الدليل الشامل لاستيراد سيارة إلى لبنان في 2024",
      contentEn: "Importing a car to Lebanon involves several steps including customs clearance, registration, and insurance. This comprehensive guide walks you through every step of the process, from choosing a vehicle abroad to driving it on Lebanese roads.",
      contentAr: "يتضمن استيراد سيارة إلى لبنان عدة خطوات بما في ذلك التخليص الجمركي والتسجيل والتأمين. يرشدك هذا الدليل الشامل خلال كل خطوة من العملية، من اختيار السيارة في الخارج إلى قيادتها على الطرق اللبنانية.",
      excerptEn: "Everything you need to know about importing a car to Lebanon: customs duties, required documents, and step-by-step process.",
      excerptAr: "كل ما تحتاج معرفته حول استيراد سيارة إلى لبنان: الرسوم الجمركية، الوثائق المطلوبة، والعملية خطوة بخطوة.",
      category: BlogCategory.IMPORT_CUSTOMS,
      tags: ["import", "customs", "guide", "lebanon"],
      authorId: adminUser.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2024-01-15"),
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "best-family-suvs-lebanon-2024" },
    update: {},
    create: {
      slug: "best-family-suvs-lebanon-2024",
      titleEn: "Best Family SUVs Available in Lebanon for 2024",
      titleAr: "أفضل سيارات الدفع الرباعي العائلية المتوفرة في لبنان لعام 2024",
      contentEn: "Looking for the perfect family SUV? We compare the top SUVs available in the Lebanese market, from budget-friendly options like the Hyundai Tucson to premium choices like the BMW X5. Find out which SUV offers the best value for Lebanese families.",
      contentAr: "هل تبحث عن سيارة دفع رباعي مثالية للعائلة؟ نقارن أفضل سيارات الدفع الرباعي المتوفرة في السوق اللبناني، من الخيارات الاقتصادية مثل هيونداي توسان إلى الخيارات الفاخرة مثل بي إم دبليو إكس 5.",
      excerptEn: "Our top picks for family SUVs in Lebanon: comfort, safety, and value compared across 10 popular models.",
      excerptAr: "اختياراتنا لأفضل سيارات الدفع الرباعي العائلية في لبنان: مقارنة الراحة والأمان والقيمة عبر 10 موديلات شهيرة.",
      category: BlogCategory.BUYING_GUIDE,
      tags: ["suv", "family", "comparison", "2024"],
      authorId: adminUser.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2024-02-01"),
    },
  });

  // --- Car Review ---
  console.log("Seeding car review...");
  await prisma.carReview.upsert({
    where: { slug: "2024-toyota-camry-review" },
    update: {},
    create: {
      slug: "2024-toyota-camry-review",
      make: "Toyota",
      model: "Camry",
      year: 2024,
      titleEn: "2024 Toyota Camry Review: Still the King of Midsize Sedans",
      titleAr: "مراجعة تويوتا كامري 2024: لا تزال ملكة سيارات السيدان المتوسطة",
      contentEn: "The 2024 Toyota Camry continues to set the standard for midsize sedans. With its new hybrid powertrain, refined interior, and Toyota's legendary reliability, the Camry remains an excellent choice for Lebanese buyers looking for a comfortable daily driver.",
      contentAr: "تواصل تويوتا كامري 2024 وضع المعايير لسيارات السيدان المتوسطة. مع محركها الهجين الجديد، والمقصورة المحسنة، وموثوقية تويوتا الأسطورية، تبقى الكامري خياراً ممتازاً للمشترين اللبنانيين الباحثين عن سيارة يومية مريحة.",
      excerptEn: "The 2024 Camry gets a new hybrid system and refreshed design. We test whether it maintains its crown.",
      excerptAr: "تحصل كامري 2024 على نظام هجين جديد وتصميم محدث. نختبر ما إذا كانت تحافظ على تاجها.",
      prosEn: ["Excellent fuel economy", "Spacious interior", "Toyota reliability", "Smooth ride quality", "Good resale value"],
      prosAr: ["اقتصادية ممتازة في استهلاك الوقود", "مقصورة واسعة", "موثوقية تويوتا", "جودة قيادة سلسة", "قيمة إعادة بيع جيدة"],
      consEn: ["Conservative styling", "No AWD option", "Infotainment could be better", "Road noise at highway speeds"],
      consAr: ["تصميم تقليدي", "لا يوجد خيار دفع رباعي", "نظام الترفيه يمكن تحسينه", "ضوضاء الطريق عند السرعات العالية"],
      verdictEn: "The 2024 Toyota Camry is a safe, reliable, and economical choice that continues to justify its position as the best-selling midsize sedan.",
      verdictAr: "تويوتا كامري 2024 هي خيار آمن وموثوق واقتصادي يستمر في تبرير موقعها كسيارة السيدان المتوسطة الأكثر مبيعاً.",
      ratingOverall: 8.5,
      ratingValue: 9.0,
      ratingInterior: 8.0,
      ratingPerformance: 7.5,
      ratingReliability: 9.5,
      ratingSafety: 9.0,
      authorId: adminUser.id,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2024-03-01"),
      seoTitleEn: "2024 Toyota Camry Review | CarSouk Lebanon",
      seoTitleAr: "مراجعة تويوتا كامري 2024 | كارسوق لبنان",
      seoDescriptionEn: "Read our comprehensive review of the 2024 Toyota Camry. Ratings, pros and cons, and whether it's the right car for Lebanese roads.",
      seoDescriptionAr: "اقرأ مراجعتنا الشاملة لتويوتا كامري 2024. التقييمات والإيجابيات والسلبيات وما إذا كانت السيارة المناسبة للطرق اللبنانية.",
      seoKeywords: ["toyota camry 2024", "camry review", "toyota lebanon", "midsize sedan"],
    },
  });

  console.log("\nSeeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
