import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const phoneOtpSchema = z.object({
  phone: z.string().min(8, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

/**
 * Phone OTP credentials provider for CarSouk.
 * Verifies a 6-digit OTP sent to the user's phone number.
 *
 * OTP sending is handled separately via a tRPC procedure.
 * This provider only verifies the OTP against stored verification tokens.
 *
 * TODO: Integrate with Twilio for SMS delivery.
 */
export const phoneOtpProvider = Credentials({
  id: "phone-otp",
  name: "Phone OTP",
  credentials: {
    phone: {
      label: "Phone Number",
      type: "tel",
      placeholder: "+961 XX XXX XXX",
    },
    otp: {
      label: "Verification Code",
      type: "text",
      placeholder: "123456",
    },
  },
  async authorize(credentials) {
    const parsed = phoneOtpSchema.safeParse(credentials);

    if (!parsed.success) {
      throw new Error("Invalid phone number or OTP format");
    }

    const { phone, otp } = parsed.data;

    // Verify the OTP against stored verification tokens
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: phone,
        token: otp,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      throw new Error("Invalid or expired OTP");
    }

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    // Find or create user by phone number
    let user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      // Create a new user with the phone number
      user = await prisma.user.create({
        data: {
          phone,
          email: `${phone.replace(/\D/g, "")}@phone.carsouk.com`,
          isVerified: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  },
});
