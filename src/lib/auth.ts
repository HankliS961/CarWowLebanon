import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/config";

/**
 * NextAuth.js v5 instance for CarSouk.
 * Export auth, signIn, signOut, and handlers for use throughout the app.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
