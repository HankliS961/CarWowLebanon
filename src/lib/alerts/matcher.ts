import { prisma } from "@/lib/prisma";
import { notifyListingMatch } from "@/lib/notifications/create";
import { sendAlertMatchEmail } from "@/lib/notifications/email";
import type { SearchAlertFrequency } from "@prisma/client";

interface CarForMatching {
  id: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  bodyType: string;
  fuelType: string;
  condition: string;
  source: string;
  locationRegion: string;
}

interface AlertFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  bodyType?: string;
  fuelType?: string;
  condition?: string;
  source?: string;
  region?: string;
}

/**
 * Check if a car listing matches a set of alert filters.
 */
function carMatchesFilters(car: CarForMatching, filters: AlertFilters): boolean {
  if (filters.make && car.make.toLowerCase() !== filters.make.toLowerCase()) {
    return false;
  }
  if (filters.model && car.model.toLowerCase() !== filters.model.toLowerCase()) {
    return false;
  }
  if (filters.yearFrom && car.year < filters.yearFrom) {
    return false;
  }
  if (filters.yearTo && car.year > filters.yearTo) {
    return false;
  }
  if (filters.priceFrom && car.priceUsd < filters.priceFrom) {
    return false;
  }
  if (filters.priceTo && car.priceUsd > filters.priceTo) {
    return false;
  }
  if (filters.bodyType && car.bodyType !== filters.bodyType) {
    return false;
  }
  if (filters.fuelType && car.fuelType !== filters.fuelType) {
    return false;
  }
  if (filters.condition && car.condition !== filters.condition) {
    return false;
  }
  if (filters.source && car.source !== filters.source) {
    return false;
  }
  if (filters.region && car.locationRegion !== filters.region) {
    return false;
  }

  return true;
}

/**
 * Match a newly listed car against all active search alerts.
 * For INSTANT frequency alerts, creates notifications immediately.
 * For DAILY/WEEKLY, the match is recorded for batch processing.
 */
export async function matchListingToAlerts(car: CarForMatching): Promise<void> {
  // Fetch all active search alerts
  const alerts = await prisma.searchAlert.findMany({
    where: { isActive: true },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  const matchedAlerts: Array<{
    alertId: string;
    userId: string;
    email: string | null;
    frequency: SearchAlertFrequency;
  }> = [];

  for (const alert of alerts) {
    const filters = (alert.filters as AlertFilters) ?? {};

    if (carMatchesFilters(car, filters)) {
      matchedAlerts.push({
        alertId: alert.id,
        userId: alert.userId,
        email: alert.user.email,
        frequency: alert.frequency,
      });
    }
  }

  // Process instant notifications
  const instantAlerts = matchedAlerts.filter((a) => a.frequency === "INSTANT");
  const carTitle = `${car.year} ${car.make} ${car.model}`;

  const notificationPromises = instantAlerts.map(async (alert) => {
    // Create in-app notification
    await notifyListingMatch({
      userId: alert.userId,
      carTitle,
      carId: car.id,
      alertId: alert.alertId,
    });

    // Send email notification
    if (alert.email) {
      await sendAlertMatchEmail(alert.email, carTitle, car.id, car.priceUsd);
    }

    // Update lastTriggeredAt
    await prisma.searchAlert.update({
      where: { id: alert.alertId },
      data: { lastTriggeredAt: new Date() },
    });
  });

  await Promise.allSettled(notificationPromises);

  // For DAILY/WEEKLY alerts, update lastTriggeredAt
  // The actual batch send would be handled by a cron job
  const batchAlerts = matchedAlerts.filter((a) => a.frequency !== "INSTANT");
  if (batchAlerts.length > 0) {
    await prisma.searchAlert.updateMany({
      where: { id: { in: batchAlerts.map((a) => a.alertId) } },
      data: { lastTriggeredAt: new Date() },
    });
  }
}
