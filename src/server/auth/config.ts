import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { credentialsProvider } from "./providers/credentials";
import { googleProvider } from "./providers/google";
import { phoneOtpProvider } from "./providers/phone-otp";
import type { UserRole } from "@prisma/client";

/**
 * NextAuth.js v5 configuration for CarSouk.
 * Supports: Email/Password, Google OAuth, Phone OTP
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [credentialsProvider, googleProvider, phoneOtpProvider],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, add user data to the JWT
      if (user) {
        token.id = user.id;
        // Fetch full user data from database for role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, languagePref: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.languagePref = dbUser.languagePref;
        }
      }

      // Allow session updates
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.languagePref) token.languagePref = session.languagePref;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.languagePref = token.languagePref as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Update last login time
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {
          // Silently fail if user doesn't exist yet (first OAuth sign-in)
        });
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Log new user creation
      console.log(`[Auth] New user created: ${user.email}`);
    },
  },
};
