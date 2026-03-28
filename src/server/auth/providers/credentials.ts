import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Email/Password credentials provider for CarSouk.
 * Validates against bcrypt-hashed passwords stored in the database.
 */
export const credentialsProvider = Credentials({
  id: "credentials",
  name: "Email & Password",
  credentials: {
    email: {
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
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

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
