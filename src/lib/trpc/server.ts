import "server-only";
import { createTRPCContext, createCallerFactory } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Server-side tRPC caller for use in Server Components.
 * Creates a context with the current request headers and calls procedures directly.
 */
const createContext = cache(async () => {
  const hdrs = new Headers(await headers());
  hdrs.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: hdrs,
  });
});

const callerFactory = createCallerFactory(appRouter);

/**
 * Use this in Server Components to call tRPC procedures directly.
 * @example
 * const cars = await api.cars.list({ page: 1, limit: 10 });
 */
export const api = callerFactory(createContext);
