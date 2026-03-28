import { z } from "zod";
import { hash } from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/** Auth router — handles registration, profile management, and OTP. */
export const authRouter = createTRPCRouter({
  /** Register a new user with email and password. */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      const passwordHash = await hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          phone: input.phone,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return user;
    }),

  /** Send an OTP to a phone number for verification. */
  sendOtp: publicProcedure
    .input(z.object({ phone: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store the OTP as a verification token
      await ctx.prisma.verificationToken.create({
        data: {
          identifier: input.phone,
          token: otp,
          expires,
        },
      });

      // TODO: Send OTP via Twilio SMS
      // For development, log the OTP
      console.log(`[OTP] Phone: ${input.phone}, Code: ${otp}`);

      return { success: true };
    }),

  /** Get the current user's profile. */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        locationRegion: true,
        locationCity: true,
        languagePref: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  /** Update the current user's profile. */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        phone: z.string().optional(),
        locationRegion: z.enum(["BEIRUT", "MOUNT_LEBANON", "NORTH", "SOUTH", "BEKAA", "NABATIEH"]).optional().nullable(),
        locationCity: z.string().optional(),
        languagePref: z.enum(["AR", "EN"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { locationRegion, languagePref, ...rest } = input;
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...rest,
          ...(locationRegion !== undefined && { locationRegion }),
          ...(languagePref !== undefined && { languagePref }),
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return user;
    }),
});
