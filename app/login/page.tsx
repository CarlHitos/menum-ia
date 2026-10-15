import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
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
      <PageHeader
        eyebrow="Acceso"
        title="Entra en tu hogar"
        action={
          <Image
            src="/branding/IconosintransparencyIA.png"
            alt="Logo de MenumIA"
            width={52}
            height={52}
            className="h-11 w-11 rounded-2xl object-contain"
            priority
          />
        }
      />

      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-center text-sm leading-6 text-[var(--color-paper)]">
          Sincroniza tu hogar para acceder a tus menus desde cualquier dispositivo.
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
      </SectionCard>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)] transition hover:text-[var(--color-accent)]"
        >
          Volver al inicio
        </Link>
      </div>
    </AppShell>
  );
}
