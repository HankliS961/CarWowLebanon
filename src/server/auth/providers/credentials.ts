import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email or phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Email/Password/Phone credentials provider for CarSouk.
 * Validates against bcrypt-hashed passwords stored in the database.
 * Supports login with either email or phone number.
 */
export const credentialsProvider = Credentials({
  id: "credentials",
  name: "Email/Phone & Password",
  credentials: {
    email: {
      label: "Email or Phone",
      type: "text",
      placeholder: "you@example.com or +961...",
    },
    password: {
      label: "Password",
      type: "password",
    },
  },
  async authorize(credentials) {
    const parsed = loginSchema.safeParse(credentials);

    if (!parsed.success) {
      throw new Error("Invalid credentials format");
    }

    const { email: input, password } = parsed.data;

    // Determine if input is phone or email
    const isPhone = input.startsWith("+") || /^\d{8,}$/.test(input);
    const user = await prisma.user.findFirst({
      where: isPhone
        ? { phone: input }
        : { email: input.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.avatarUrl,
    };
  },
});
