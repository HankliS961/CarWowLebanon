import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";

/** Admin router — platform administration. */
export const adminRouter = createTRPCRouter({
  /** Get platform statistics. */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [users, dealers, cars, inquiries, sellListings] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.dealer.count(),
      ctx.prisma.car.count({ where: { status: "ACTIVE" } }),
      ctx.prisma.inquiry.count(),
      ctx.prisma.sellListing.count(),
    ]);

    return { users, dealers, cars, inquiries, sellListings };
  }),

  /** List all users with pagination. */
  listUsers: adminProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(25) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
          },
        }),
        ctx.prisma.user.count(),
      ]);
      return { users, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Verify a dealer. */
  verifyDealer: adminProcedure
    .input(z.object({ dealerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.update({
        where: { id: input.dealerId },
        data: { isVerified: true, status: "ACTIVE" },
      });

      // Log admin action
      await ctx.prisma.adminLog.create({
        data: {
          adminId: ctx.session.user.id,
          action: "VERIFY_DEALER",
          targetType: "Dealer",
          targetId: input.dealerId,
        },
      });

      return dealer;
    }),

  /** Get admin logs. */
  getLogs: adminProcedure
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      return ctx.prisma.adminLog.findMany({
        skip,
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { name: true, email: true } } },
      });
    }),
});
