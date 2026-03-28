import Google from "next-auth/providers/google";

/**
 * Google OAuth provider for CarSouk.
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.
 */
export const googleProvider = Google({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  allowDangerousEmailAccountLinking: true,
});
