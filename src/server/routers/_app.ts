import { createTRPCRouter } from "../trpc";
import { authRouter } from "./auth";
import { carsRouter } from "./cars";
import { dealersRouter } from "./dealers";
import { inquiriesRouter } from "./inquiries";
import { configurationsRouter } from "./configurations";
import { offersRouter } from "./offers";
import { sellListingsRouter } from "./sell-listings";
import { sellBidsRouter } from "./sell-bids";
import { reviewsRouter } from "./reviews";
import { notificationsRouter } from "./notifications";
import { savedCarsRouter } from "./saved-cars";
import { searchAlertsRouter } from "./search-alerts";
import { adminRouter } from "./admin";
import { carMakesRouter } from "./car-makes";
import { toolsRouter } from "./tools";
import { contentRouter } from "./content";

/**
 * Root tRPC router for CarSouk.
 * All sub-routers are composed here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  cars: carsRouter,
  dealers: dealersRouter,
  inquiries: inquiriesRouter,
  configurations: configurationsRouter,
  offers: offersRouter,
  sellListings: sellListingsRouter,
  sellBids: sellBidsRouter,
  reviews: reviewsRouter,
  notifications: notificationsRouter,
  savedCars: savedCarsRouter,
  searchAlerts: searchAlertsRouter,
  admin: adminRouter,
  carMakes: carMakesRouter,
  tools: toolsRouter,
  content: contentRouter,
});

/** Type definition for the complete tRPC API. */
export type AppRouter = typeof appRouter;
