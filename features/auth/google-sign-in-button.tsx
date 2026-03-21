"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type GoogleSignInButtonProps = {
  callbackUrl: string;
};

export function GoogleSignInButton({
  callbackUrl,
}: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setIsPending(true);
        await signIn("google", { callbackUrl });
        setIsPending(false);
      }}
      disabled={isPending}
      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
    >
      {isPending ? "Abriendo Google..." : "Continuar con Google"}
    </button>
  );
}
