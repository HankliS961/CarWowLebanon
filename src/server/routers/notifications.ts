import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/** Notifications router — user notifications. */
export const notificationsRouter = createTRPCRouter({
  /** Get notifications for the current user (paginated). */
  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        ...(input.unreadOnly && { isRead: false }),
      };

      const [items, total] = await Promise.all([
        ctx.prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: input.offset,
          take: input.limit,
        }),
        ctx.prisma.notification.count({ where }),
      ]);

      return { items, total };
    }),

  /** Get unread notification count. */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.notification.count({
      where: { userId: ctx.session.user.id, isRead: false },
    });
  }),

  /** Mark a notification as read. */
  markRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.notification.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { isRead: true },
      });
    }),

  /** Mark all notifications as read. */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: { userId: ctx.session.user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }),

  /** Delete a notification. */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      return { success: true };
    }),
});
