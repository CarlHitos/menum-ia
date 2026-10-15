import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    invalidUserId?: string;
    user?: DefaultSession["user"] & {
      id: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    invalidUserId?: string;
  }
}
