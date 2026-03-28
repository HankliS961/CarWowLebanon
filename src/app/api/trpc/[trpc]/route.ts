import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

/**
 * tRPC API route handler for Next.js App Router.
 * All tRPC requests go through /api/trpc/[procedure].
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`[tRPC] Error on '${path ?? "<no-path>"}':`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
