import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
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
        action={
          <Image
            src="/branding/Iconosintransparency.png"
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
          Sincronizad vuestro hogar para acceder a vuestros menús desde cualquier dispositivo.
        </p>

        <GoogleSignInButton callbackUrl={callbackUrl} />

        {error ? (
          <p className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs leading-5 text-red-100">
            No se ha podido iniciar sesion con Google. Revisad la configuracion
            OAuth y volved a intentarlo.
          </p>
        ) : null}

        <p className="mt-3 text-center text-xs leading-5 text-[var(--color-muted)]">
          Prometemos no cotillear vuestra nevera sin permiso. 😉
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
