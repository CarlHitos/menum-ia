"use client";

import { useStepNavigation } from "@/lib/ui/use-step-navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Recipe } from "@/lib/domain/types";
import { SectionCard } from "@/components/ui/section-card";

type CookingModeProps = {
  recipe: Recipe;
  requestedServings: number;
  contextQuery?: string;
};

export function CookingMode({ recipe, requestedServings, contextQuery = "" }: CookingModeProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [reviewing, setReviewing] = useState(false);
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
  const recipeCompleted = recipe.steps.length > 0 && completedSteps.length === recipe.steps.length;
  const showSuccess = recipeCompleted && !reviewing;
  const stepStartRef = useStepNavigation(showSuccess ? "finished" : activeStep);

  function selectStep(index: number) {
    setReviewing(true);
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

  function handleStepAction() {
    setRunning(false);
    const alreadyCompleted = completedSteps.includes(currentStep.id);

    if (alreadyCompleted) {
      toggleStepCompleted(currentStep.id);
      return;
    }

    toggleStepCompleted(currentStep.id);
    setReviewing(false);

    if (activeStep < recipe.steps.length - 1) {
      selectStep(activeStep + 1);
      setReviewing(false);
    }
  }

  if (showSuccess) {
    return (
      <div ref={stepStartRef} tabIndex={-1} className="scroll-mt-6 outline-none" aria-label="Receta completada">
        <SectionCard className="bg-[linear-gradient(145deg,rgba(135,214,141,0.18),rgba(255,255,255,0.08))]">
          <p role="status" className="text-xs uppercase tracking-[0.18em] text-[var(--color-success)]">
            Receta terminada · {completedSteps.length}/{recipe.steps.length} pasos
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-paper)]">Todo listo para servir</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-paper)]">
            Sirve la preparación ({requestedServings} {requestedServings === 1 ? "ración" : "raciones"}).
          </p>
          <Link
            href={contextQuery ? "/dashboard" : "/recipes"}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-base font-semibold text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
          >
            <span className="text-slate-950">¡A comer! 🍽️</span>
          </Link>
          <button
            type="button"
            onClick={() => selectStep(recipe.steps.length - 1)}
            className="mt-2 min-h-11 w-full text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-paper)]"
          >
            Volver atrás para revisar los pasos
          </button>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={stepStartRef} tabIndex={-1} role="group" aria-label={`Paso ${activeStep + 1} de ${recipe.steps.length}`} className="scroll-mt-6 outline-none">
        <SectionCard className="border-[rgba(252,163,17,0.4)] bg-[linear-gradient(135deg,rgba(252,163,17,0.24),rgba(255,255,255,0.1))] shadow-[0_0_0_1px_rgba(252,163,17,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="break-words font-display text-2xl font-semibold leading-tight text-[var(--color-paper)]">
                {currentStep.title}
              </h2>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                completedSteps.includes(currentStep.id)
                  ? "bg-[var(--color-success)] text-slate-950"
                  : "border border-[var(--color-border)] text-[var(--color-paper)]"
              }`}
            >
              {completedSteps.includes(currentStep.id) ? "Completado" : "En curso"}
            </span>
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
      </div>

      {timerAvailable ? (
        <SectionCard>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Timer
              </p>
              <p className="mt-2 font-display text-4xl font-semibold text-[var(--color-paper)]">
                {minutes}:{seconds}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRunning((current) => !current)}
                className="rounded-full bg-[var(--color-accent)] px-5 py-3.5 text-sm font-semibold text-slate-950"
              >
                {running ? "Pausar" : "Iniciar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(0);
                }}
                className="rounded-full border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
              >
                Omitir
              </button>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard>
        <button
          type="button"
          onClick={handleStepAction}
          className={`w-full rounded-2xl px-4 py-4 text-base font-semibold transition ${
            completedSteps.includes(currentStep.id)
              ? "border border-[var(--color-border)] text-[var(--color-paper)] hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
              : "bg-[var(--color-accent)] text-slate-950"
          }`}
        >
          {completedSteps.includes(currentStep.id) ? "Deshacer" : "Hecho!"}
        </button>
      </SectionCard>

      {recipeCompleted ? (
        <button type="button" onClick={() => setReviewing(false)} className="min-h-11 w-full text-sm font-semibold text-[var(--color-accent)]">
          Volver al resumen final
        </button>
      ) : null}

      <nav aria-label="Pasos de la receta" className="flex flex-wrap gap-2">
        {recipe.steps.map((step, index) => {
          const completed = completedSteps.includes(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => selectStep(index)}
              aria-label={`Paso ${index + 1}: ${step.title}. ${completed ? "Completado" : "Pendiente"}`}
              aria-current={index === activeStep ? "step" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                index === activeStep
                  ? "border-[var(--color-accent)] bg-[rgba(252,163,17,0.16)] text-[var(--color-paper)]"
                  : completed
                    ? "border-[rgba(135,214,141,0.35)] bg-[rgba(135,214,141,0.1)] text-[var(--color-paper)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-paper)]"
              }`}
            >
              Paso {index + 1}
              {completed ? <span aria-hidden="true" className="text-[var(--color-success)]">✓</span> : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
