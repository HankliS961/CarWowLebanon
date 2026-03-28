"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/**
 * Client-side tRPC hooks for use in Client Components.
 * @example
 * const { data } = trpc.cars.list.useQuery({ page: 1 });
 */
export const trpc = createTRPCReact<AppRouter>();
