"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Recipe } from "@/lib/domain/types";
import { SectionCard } from "@/components/ui/section-card";

type CookingModeProps = {
  recipe: Recipe;
};

export function CookingMode({ recipe }: CookingModeProps) {
  const [activeStep, setActiveStep] = useState(0);
  const initialSeconds = recipe.steps[0]?.timerSeconds ?? 0;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!running || secondsLeft === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  const currentStep = recipe.steps[activeStep];
  const timerAvailable = Boolean(currentStep?.timerSeconds);
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const completionRatio = completedSteps.length / recipe.steps.length;
  const recipeCompleted = completedSteps.length === recipe.steps.length;

  const nextPendingStep = useMemo(
    () =>
      recipe.steps.findIndex((step) => !completedSteps.includes(step.id)),
    [completedSteps, recipe.steps],
  );

  function selectStep(index: number) {
    const nextInitial = recipe.steps[index]?.timerSeconds ?? 0;
    setActiveStep(index);
    setSecondsLeft(nextInitial);
    setRunning(false);
  }

  function toggleStepCompleted(stepId: string) {
    setCompletedSteps((current) =>
      current.includes(stepId)
        ? current.filter((entry) => entry !== stepId)
        : [...current, stepId],
    );
  }

  function goToNextStep() {
    if (activeStep < recipe.steps.length - 1) {
      selectStep(activeStep + 1);
    }
  }

  function focusNextPendingStep() {
    if (nextPendingStep >= 0) {
      selectStep(nextPendingStep);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(135deg,rgba(252,163,17,0.2),rgba(255,255,255,0.08))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              Paso {activeStep + 1} de {recipe.steps.length}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--color-paper)]">
              {currentStep.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => toggleStepCompleted(currentStep.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              completedSteps.includes(currentStep.id)
                ? "bg-[var(--color-success)] text-slate-950"
                : "border border-[var(--color-border)] text-[var(--color-paper)]"
            }`}
          >
            {completedSteps.includes(currentStep.id) ? "Completado" : "Marcar paso"}
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          {currentStep.detail}
        </p>

        {currentStep.checklist?.length ? (
          <ul className="mt-4 space-y-2">
            {currentStep.checklist.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-2 text-sm text-[var(--color-paper)]"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all"
            style={{ width: `${completionRatio * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {completedSteps.length}/{recipe.steps.length} pasos completados
        </p>
      </SectionCard>

      <SectionCard>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Timer opcional
            </p>
            <p className="mt-2 font-display text-4xl font-semibold text-[var(--color-paper)]">
              {minutes}:{seconds}
            </p>
          </div>
          {timerAvailable ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRunning((current) => !current)}
                className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
              >
                {running ? "Pausar" : "Iniciar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(0);
                }}
                className="rounded-full border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
              >
                Omitir
              </button>
            </div>
          ) : (
            <span className="text-sm text-[var(--color-muted)]">Este paso no necesita timer</span>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleStepCompleted(currentStep.id)}
            className="flex-1 rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
          >
            {completedSteps.includes(currentStep.id)
              ? "Desmarcar paso"
              : "Completar este paso"}
          </button>
          <button
            type="button"
            onClick={goToNextStep}
            className="flex-1 rounded-2xl bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
          >
            Siguiente paso
          </button>
        </div>
      </SectionCard>

      {recipeCompleted ? (
        <SectionCard className="bg-[linear-gradient(145deg,rgba(135,214,141,0.18),rgba(255,255,255,0.08))]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-success)]">
            Receta terminada
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--color-paper)]">
            Todo listo para servir
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Has completado todos los pasos. Puedes volver al menu semanal o
            seguir con la compra del resto de la semana.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
            >
              Volver al menu
            </Link>
            <Link
              href="/shopping-list"
              className="rounded-full border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
            >
              Seguir con la compra
            </Link>
          </div>
        </SectionCard>
      ) : (
        <SectionCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Progreso
              </p>
              <p className="mt-1 text-sm text-[var(--color-paper)]">
                Sigue aunque no uses timer. El progreso depende solo de los pasos completados.
              </p>
            </div>
            <button
              type="button"
              onClick={focusNextPendingStep}
              className="rounded-full border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
            >
              Ir al siguiente pendiente
            </button>
          </div>
        </SectionCard>
      )}

      <div className="grid gap-2">
        {recipe.steps.map((step, index) => {
          const completed = completedSteps.includes(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => selectStep(index)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                index === activeStep
                  ? "border-[rgba(252,163,17,0.55)] bg-[rgba(252,163,17,0.16)]"
                  : completed
                    ? "border-[rgba(135,214,141,0.35)] bg-[rgba(135,214,141,0.1)]"
                    : "border-[var(--color-border)] bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Paso {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-paper)]">
                    {step.title}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {completed ? "ok" : "pendiente"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
