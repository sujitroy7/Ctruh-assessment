import { DefaultSession } from "next-auth";

export type Role = "owner" | "customer";

export interface Session {
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  error?: string;
  user: {
    id: string;
    role: Role;
  } & DefaultSession["user"];
}

export interface User {
  id: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
}

export interface JWT {
  id: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  error?: string;
}
