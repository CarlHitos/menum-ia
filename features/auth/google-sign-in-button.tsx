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
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5a9.5 9.5 0 0 0 0 19c5.5 0 9.1-3.9 9.1-9.4 0-.6-.1-1.1-.2-1.6H12Z"
          />
          <path
            fill="#34A853"
            d="M2.5 7.9 5.7 10.3c.9-1.8 2.8-3.4 6.3-3.4 1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5c-3.7 0-6.8 2.1-8.5 5.4Z"
          />
          <path
            fill="#FBBC05"
            d="M2.5 16.1A9.4 9.4 0 0 1 1.9 12c0-1.4.3-2.8.6-4.1l3.2 2.4A6 6 0 0 0 6.1 12c0 .6.1 1.2.3 1.7l-3.9 2.4Z"
          />
          <path
            fill="#4285F4"
            d="M12 21.5c2.4 0 4.5-.8 6-2.2l-2.9-2.4c-.8.6-1.8 1.1-3.1 1.1-3.8 0-5.2-2.5-5.5-3.8l-3.2 2.5c1.6 3.2 4.9 4.8 8.7 4.8Z"
          />
        </svg>
      </span>
      {isPending ? "Abriendo Google..." : "Continuar con Google"}
    </button>
  );
}
