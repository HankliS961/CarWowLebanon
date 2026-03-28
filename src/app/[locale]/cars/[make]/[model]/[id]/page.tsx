import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { formatPriceUsd, absoluteUrl } from "@/lib/utils";
import { CarDetailClient } from "./_components/CarDetailClient";

interface CarDetailParams {
  locale: string;
  make: string;
  model: string;
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CarDetailParams>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  let car;
  try {
    car = await api.cars.getById({ id });
  } catch {
    return {};
  }
  if (!car) return {};

  const title = `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""} for Sale`;
  const price = formatPriceUsd(car.priceUsd as unknown as number);
  const description =
    locale === "ar"
      ? `${car.year} ${car.make} ${car.model} للبيع بسعر ${price} في لبنان. ${car.mileageKm.toLocaleString()} كم.`
      : `${title} - ${price} in Lebanon. ${car.mileageKm.toLocaleString()} km. ${car.fuelType}, ${car.transmission}.`;

  const images = car.images as string[] | null;
  const ogImage = images?.[0] || car.thumbnailUrl;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${price}`,
      description,
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${price}`,
      description,
    },
    alternates: {
      canonical: `/${locale}/cars/${car.make.toLowerCase()}/${car.model.toLowerCase()}/${car.id}`,
    },
  };
}

/** Individual car listing detail page. */
export default async function CarDetailPage({
  params,
}: {
  params: Promise<CarDetailParams>;
}) {
  const { locale, id } = await params;
  let car;
  try {
    car = await api.cars.getById({ id });
  } catch {
    notFound();
  }
  if (!car) notFound();

  const t = await getTranslations({ locale, namespace: "common" });

  // JSON-LD Vehicle schema
  const price = car.priceUsd as unknown as number;
  const images = (car.images as string[] | null) || [];
  const vehicleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""}`,
    manufacturer: { "@type": "Organization", name: car.make },
    model: car.model,
    modelDate: String(car.year),
    vehicleTransmission: car.transmission,
    fuelType: car.fuelType,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.mileageKm,
      unitCode: "KMT",
    },
    bodyType: car.bodyType,
    color: car.colorExterior || undefined,
    image: images.length > 0 ? images : car.thumbnailUrl ? [car.thumbnailUrl] : [],
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: car.dealer
        ? {
            "@type": "AutoDealer",
            name: car.dealer.companyName,
          }
        : undefined,
    },
    url: absoluteUrl(`/${locale}/cars/${car.make.toLowerCase()}/${car.model.toLowerCase()}/${car.id}`),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }}
      />
      <CarDetailClient car={car} locale={locale} />
    </>
  );
}
