import type { NextAuthOptions } from "next-auth";

type SessionCallbacks = Required<
  Pick<NonNullable<NextAuthOptions["callbacks"]>, "jwt" | "session">
>;

type FindUser = (id: string) => Promise<{ id: string } | null>;

// Check on every session read, including API calls. Never cache account existence
// across requests: a previously issued JWT must not outlive a deleted account.
export function createSessionCallbacks(findUser: FindUser): SessionCallbacks {
  return {
    async jwt({ token }) {
      if (token.invalidUserId || !token.sub) {
        return { ...token, sub: undefined };
      }

      // Let database failures propagate. They must not grant access or be
      // mistaken for account deletion (which would erase the local draft).
      const user = await findUser(token.sub);

      if (!user) {
        return { ...token, sub: undefined, invalidUserId: token.sub };
      }

      return token;
    },
    session({ session, token }) {
      if (!token.sub || token.invalidUserId) {
        return {
          expires: session.expires,
          invalidUserId:
            typeof token.invalidUserId === "string"
              ? token.invalidUserId
              : undefined,
        };
      }

      if (session.user) {
        session.user.id = token.sub;
      }

      return session;
    },
  };
}
