import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { GoogleSignInButton } from "@/features/auth/google-sign-in-button";
import { InvalidSessionCleanup } from "@/features/auth/invalid-session-cleanup";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const callbackUrl = params.callbackUrl ?? "/dashboard";
  const error = params.error;
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <AppShell currentPath="/" hideBottomNav>
      <div className="mb-1 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Volver al inicio"
          title="Volver al inicio"
          className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[rgba(255,255,255,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4 text-[var(--color-muted)]" strokeWidth={1.75} />
        </Link>
        <Image
          src="/branding/IconosintransparencyIA.png"
          alt="Logo de MenumIA"
          width={52}
          height={52}
          className="h-11 w-11 rounded-2xl object-contain"
          priority
        />
      </div>
      <PageHeader
        eyebrow="Acceso"
        title="Conecta tu cuenta"
        titleSize="small"
      />

      <div>
        <p className="text-center text-sm leading-6 text-[var(--color-paper)]">
          Accede a tu hogar desde cualquier dispositivo y mantén tus menús siempre a mano.
        </p>

        {session?.invalidUserId ? (
          <InvalidSessionCleanup userId={session.invalidUserId} />
        ) : (
          <GoogleSignInButton callbackUrl={callbackUrl} />
        )}

        {error ? (
          <p className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs leading-5 text-red-100">
            No se ha podido iniciar sesion con Google. Revisa la configuracion
            OAuth y vuelve a intentarlo.
          </p>
        ) : null}

        <p className="mt-3 text-center text-xs leading-5 text-[var(--color-muted)]">
          Prometemos no cotillear tu nevera sin permiso. 😉
        </p>
      </div>
    </AppShell>
  );
}
