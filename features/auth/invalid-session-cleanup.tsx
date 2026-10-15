"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession, signOut } from "next-auth/react";
import { clearOnboardingState } from "@/lib/local-storage/onboarding-storage";

export function InvalidSessionCleanup({ userId }: { userId: string }) {
  const [failed, setFailed] = useState(false);
  const cleanup = useCallback(async () => {
    clearOnboardingState(userId);

    await signOut({ redirect: false });
    const remainingSession = await getSession();
    if (remainingSession?.user?.id || remainingSession?.invalidUserId) {
      throw new Error("Session could not be cleared");
    }
    // A full navigation discards the previous session and cached page tree.
    // Keep the login URL and its destination for the next Google sign-in.
    window.location.reload();
  }, [userId]);

  useEffect(() => {
    void cleanup().catch(() => setFailed(true));
  }, [cleanup]);

  return (
    <div className="mt-4 text-center text-sm text-[var(--color-paper)]">
      <p role="status">
        {failed
          ? "No se ha podido cerrar la sesión anterior. Vuelve a intentarlo."
          : "Tu cuenta ya no está disponible. Cerrando la sesión anterior…"}
      </p>
      {failed ? (
        <button
          type="button"
          onClick={() => void cleanup().catch(() => setFailed(true))}
          className="mt-3 rounded-full border border-[var(--color-border)] px-4 py-2 font-semibold"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
