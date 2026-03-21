import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";

type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
  };
};

export async function requireAuth(
  callbackUrl: string,
): Promise<AuthenticatedSession> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return session as AuthenticatedSession;
}
