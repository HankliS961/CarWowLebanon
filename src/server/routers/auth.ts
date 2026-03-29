import { z } from "zod";
import { hash } from "bcryptjs";
import twilio from "twilio";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/** Lazily create a Twilio client; returns null when credentials are missing. */
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

/** Auth router — handles registration, profile management, and OTP. */
export const authRouter = createTRPCRouter({
  /** Register a new user with email and password. */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
        phone: z.string().min(8, "Phone number is required"),
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
          isVerified: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return user;
    }),

  /** Send an OTP to a phone number for verification via WhatsApp. */
  sendOtp: publicProcedure
    .input(z.object({ phone: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTP for this phone
      await ctx.prisma.verificationToken.deleteMany({
        where: { identifier: input.phone },
      });

      // Store the OTP
      await ctx.prisma.verificationToken.create({
        data: {
          identifier: input.phone,
          token: otp,
          expires,
        },
      });

      // Send OTP via WhatsApp using Twilio
      const twilioClient = getTwilioClient();
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
          await twilioClient.messages.create({
            body: `Your CarSouk verification code is: ${otp}\n\nValid for 10 minutes. Do not share this code.`,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${input.phone}`,
          });
        } catch (error) {
          console.error("[OTP] Failed to send WhatsApp OTP:", error);
          if (process.env.NODE_ENV === "development") {
            console.log(`[DEV] OTP for ${input.phone}: ${otp}`);
          }
        }
      } else {
        console.warn("[OTP] Twilio not configured. WhatsApp OTP not sent.");
        if (process.env.NODE_ENV === "development") {
          console.log(`[DEV] OTP for ${input.phone}: ${otp}`);
        }
      }

      return { success: true };
    }),

  /** Verify an OTP code for a phone number. */
  verifyOtp: publicProcedure
    .input(z.object({
      phone: z.string().min(8),
      otp: z.string().length(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.prisma.verificationToken.findFirst({
        where: {
          identifier: input.phone,
          token: input.otp,
          expires: { gt: new Date() },
        },
      });

      if (!token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification code",
        });
      }

      // Delete the used token
      await ctx.prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: token.identifier,
            token: token.token,
          },
        },
      });

      return { verified: true };
    }),

  /** Request a password reset OTP sent via WhatsApp. */
  resetPasswordRequest: publicProcedure
    .input(z.object({ phone: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      // Check user exists with this phone
      const user = await ctx.prisma.user.findUnique({
        where: { phone: input.phone },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account found with this phone number" });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      // Clear old tokens for this phone
      await ctx.prisma.verificationToken.deleteMany({
        where: { identifier: `reset:${input.phone}` },
      });

      // Store OTP with "reset:" prefix to distinguish from signup OTPs
      await ctx.prisma.verificationToken.create({
        data: {
          identifier: `reset:${input.phone}`,
          token: otp,
          expires,
        },
      });

      // Send via WhatsApp
      const twilioClient = getTwilioClient();
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
          await twilioClient.messages.create({
            body: `Your CarSouk password reset code is: ${otp}\n\nValid for 10 minutes. If you didn't request this, ignore this message.`,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${input.phone}`,
          });
        } catch (error) {
          console.error("[Reset] Failed to send WhatsApp:", error);
          if (process.env.NODE_ENV === "development") {
            console.log(`[DEV] Reset OTP for ${input.phone}: ${otp}`);
          }
        }
      } else if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Reset OTP for ${input.phone}: ${otp}`);
      }

      return { success: true };
    }),

  /** Reset password using OTP verification. */
  resetPassword: publicProcedure
    .input(z.object({
      phone: z.string().min(8),
      otp: z.string().length(6),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify OTP
      const token = await ctx.prisma.verificationToken.findFirst({
        where: {
          identifier: `reset:${input.phone}`,
          token: input.otp,
          expires: { gt: new Date() },
        },
      });

      if (!token) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset code" });
      }

      // Delete used token
      await ctx.prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: token.identifier,
            token: token.token,
          },
        },
      });

      // Find user and update password
      const user = await ctx.prisma.user.findUnique({
        where: { phone: input.phone },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const passwordHash = await hash(input.newPassword, 12);
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

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
