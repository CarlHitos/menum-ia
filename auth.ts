import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";
import { getServerEnv } from "@/lib/server/env";
import { getUserById } from "@/lib/dal/users";
import { createSessionCallbacks } from "@/lib/auth/session-validation";

const env = getServerEnv();

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  secret: env.authSecret,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: createSessionCallbacks(getUserById),
  providers: [
    GoogleProvider({
      clientId: env.authGoogleId,
      clientSecret: env.authGoogleSecret,
    }),
  ],
};

export default NextAuth(authOptions);
