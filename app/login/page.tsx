import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { GoogleSignInButton } from "@/features/auth/google-sign-in-button";

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

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <AppShell currentPath="/" hideBottomNav>
      <PageHeader
        eyebrow="Acceso"
        title="Entrad en vuestro hogar"
        description="Usad vuestra cuenta de Google para guardar el hogar, el onboarding y la semana activa."
      />

      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-sm leading-6 text-[var(--color-paper)]">
          Este primer acceso activa la persistencia real de vuestra cuenta sin
          cambiar el flujo principal de la app.
        </p>

        <GoogleSignInButton callbackUrl={callbackUrl} />

        {error ? (
          <p className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-100">
            No se ha podido iniciar sesion con Google. Revisad la configuracion
            OAuth y volved a intentarlo.
          </p>
        ) : null}

        <p className="mt-3 text-center text-xs leading-5 text-[var(--color-muted)]">
          De momento solo pediremos acceso para iniciar sesion y guardar vuestro
          hogar.
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
