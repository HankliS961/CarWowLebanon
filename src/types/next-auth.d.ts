import type { UserRole } from "@prisma/client";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      languagePref: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: UserRole;
    languagePref?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    languagePref?: string;
  }
}
