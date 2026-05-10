/* eslint-disable @typescript-eslint/no-empty-object-type */
import "next-auth";
import "next-auth/jwt";
import { Session as TSession, User as TUser, JWT as TJwt } from "@/types/auth";

declare module "next-auth" {
  interface Session extends TSession {}
  interface User extends TUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends TJwt {}
}
