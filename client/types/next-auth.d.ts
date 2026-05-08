import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user: {
      id: string;
      role: "owner" | "customer";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "owner" | "customer";
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "owner" | "customer";
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}
