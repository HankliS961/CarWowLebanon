import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * tRPC context creation.
 * Provides Prisma client and auth session to all procedures.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    prisma,
    session,
    ...opts,
  };
};

/** Type for the tRPC context. */
export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC initialization with superjson transformer and Zod error formatting.
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a tRPC caller for server-side usage (Server Components).
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Create a tRPC router.
 */
export const createTRPCRouter = t.router;

/**
 * Middleware to log procedure execution time.
 */
const timingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  if (duration > 1000) {
    console.warn(`[tRPC] Slow ${type} '${path}': ${duration}ms`);
  }

  return result;
});

/**
 * Public procedure — no authentication required.
 * Available to all users including anonymous visitors.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Middleware that enforces authentication.
 * Rejects requests without a valid session.
 */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session as Session & { user: NonNullable<Session["user"]> },
    },
  });
});

/**
 * Protected procedure — requires authentication.
 * The session is guaranteed to exist in the context.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAuth);

/**
 * Middleware that enforces admin role.
 */
const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({
    ctx: {
      session: ctx.session as Session & { user: NonNullable<Session["user"]> },
    },
  });
});

/**
 * Admin procedure — requires ADMIN role.
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAdmin);

/**
 * Middleware that enforces dealer role.
 */
const enforceDealer = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "DEALER" && ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Dealer access required" });
  }
  return next({
    ctx: {
      session: ctx.session as Session & { user: NonNullable<Session["user"]> },
    },
  });
});

/**
 * Dealer procedure — requires DEALER or ADMIN role.
 */
export const dealerProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceDealer);
