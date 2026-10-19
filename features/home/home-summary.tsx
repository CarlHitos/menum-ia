import Link from "next/link";
import Image from "next/image";
import { ArrowRight, House, ShoppingCart, Target, type LucideIcon } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { menuViewKey } from "@/lib/ui/menu-navigation";
import type { Household } from "@/lib/domain/types";
import type { HomeSummaryData } from "./home-summary-data";
import { TodayMenu } from "./today-menu";

export function HomeSummary({ household, userName, summary }: {
  household: Household;
  userName?: string | null;
  summary: HomeSummaryData;
}) {
  const firstName = userName?.trim().split(/\s+/)[0];
  const goals = [...new Set(household.members.map((member) => member.goal))];
  const goalLabels: Record<string, string> = {
    gain: "Ganar fuerza", lose: "Perder peso", maintain: "Mantenerse", "eat-better": "Comer mejor",
  };
  const goal = goals.length > 1 ? "Objetivos diversos" : goalLabels[goals[0]] ?? "Sin definir";
  const hasPlan = summary.status !== null;
  const preferredStore = household.planningPreferences.preferredStores[0];

  return (
    <>
      <header className="mb-1 flex items-center justify-between gap-4">
        <span className="font-display text-sm font-semibold tracking-[0.18em] text-[var(--color-accent-soft)]">MENUMIA</span>
        <Image src="/branding/IconosintransparencyIA.png" alt="Logo de MenumIA" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" priority />
      </header>
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{firstName ? `¡Hola, ${firstName}!` : "¡Hola!"} <span aria-hidden="true">👋</span></h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <MetadataPill icon={House} label="Hogar" value={household.name} />
            {preferredStore ? <MetadataPill icon={ShoppingCart} label="Supermercado" value={preferredStore} /> : null}
            <MetadataPill icon={Target} label="Objetivo" value={goal} />
          </div>
          <div aria-label="Integrantes del hogar" className="mt-2 flex gap-2 overflow-x-auto overscroll-x-contain py-1.5">
            {household.members.map((member) => (
              <span key={member.id} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-xs text-[var(--color-muted)]">
                <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(252,163,17,0.12)] text-[10px] font-semibold text-[var(--color-accent-soft)]">
                  {member.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                </span>
                <span className="whitespace-nowrap">{member.name}</span>
              </span>
            ))}
          </div>
        </div>

        <TodayMenu days={summary.days} status={summary.status} rangeLabel={summary.rangeLabel} viewKey={summary.planId ? menuViewKey(household.id, summary.planId) : undefined} />

        <div className="grid grid-cols-2 gap-2">
          <SectionCard className="flex min-w-0 flex-col !rounded-2xl !p-3">
            <h2 className="text-sm font-semibold text-[var(--color-paper)]">Menú semanal</h2>
            <p className={`mt-2 text-sm font-medium ${summary.status === "confirmed" ? "text-[var(--color-success)]" : "text-[var(--color-accent-soft)]"}`}>
              {!hasPlan ? "Sin generar" : summary.status === "confirmed" ? "Confirmado" : "En edición"}
            </p>
            {hasPlan ? <p className="mt-1 text-[11px] text-[var(--color-muted)]">{summary.rangeLabel}</p> : null}
            <QuickLink href="/dashboard" label={hasPlan ? "Abrir menú" : "Generar menú"} />
          </SectionCard>
          <SectionCard className="flex min-w-0 flex-col !rounded-2xl !p-3">
            <h2 className="text-sm font-semibold text-[var(--color-paper)]">Compra semanal</h2>
            {hasPlan ? (
              <>
                <p className="mt-2 text-lg font-semibold leading-tight text-[var(--color-paper)]">{summary.shopping.percentage}%</p>
                <p className="mt-1 text-[11px] text-[var(--color-muted)]">{summary.shopping.checked} de {summary.shopping.total} productos</p>
                <div role="progressbar" aria-label="Progreso de compra" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.shopping.percentage} aria-valuetext={`${summary.shopping.checked} de ${summary.shopping.total} productos marcados`} className="mt-2 h-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                  <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${summary.shopping.percentage}%` }} />
                </div>
              </>
            ) : <p className="mt-2 text-xs text-[var(--color-muted)]">Pendiente de generar el menú</p>}
            <QuickLink href="/shopping-list" label="Abrir lista" />
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function MetadataPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <span aria-label={`${label}: ${value}`} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#D5A45F] bg-[#343C50] px-2.5 py-1.5 text-[11px] font-light leading-tight text-[#F1EDE7]">
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#D5A45F]" strokeWidth={1.5} />
      <span className="min-w-0 break-words">{value}</span>
    </span>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-auto pt-2">
      <Link href={href} className="group inline-flex min-h-11 items-center gap-1 rounded-lg text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
        <span className="text-[var(--color-paper)] transition-colors group-hover:text-[var(--color-accent-soft)]">{label}</span>
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#D5B582] transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
