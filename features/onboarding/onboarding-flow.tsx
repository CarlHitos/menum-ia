"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StepActions } from "@/components/ui/step-actions";
import { OnboardingProgress } from "@/features/onboarding/onboarding-progress";
import { HouseholdSizeStep } from "@/features/onboarding/household-size-step";
import { MembersStep } from "@/features/onboarding/members-step";
import { OnboardingReview } from "@/features/onboarding/onboarding-review";
import { PreferencesStep } from "@/features/onboarding/preferences-step";
import type {
  OnboardingDraft,
  OnboardingMemberDraft,
} from "@/features/onboarding/types";
import type { Household } from "@/lib/domain/types";
import { buildInitialOnboardingDraft } from "@/lib/local-storage/onboarding-mappers";
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/local-storage/onboarding-storage";

type OnboardingFlowProps = {
  initialHousehold?: Household | null;
  userId: string;
};

const steps = ["Hogar", "Miembros", "Preferencias", "Resumen"];

function buildMembersForCount(
  count: number,
  currentMembers: OnboardingMemberDraft[],
) {
  return Array.from({ length: count }, (_, index) => {
    const existing = currentMembers[index];

    return (
      existing ?? {
        id: `member-${index + 1}`,
        name: "",
        goal: "",
        allergies: "",
        restrictions: "",
        dislikes: "",
      }
    );
  });
}

export function OnboardingFlow({
  initialHousehold,
  userId,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [showHouseholdNameError, setShowHouseholdNameError] = useState(false);
  const [showMemberNameError, setShowMemberNameError] = useState(false);
  const [showMemberGoalError, setShowMemberGoalError] = useState(false);
  const [showMealsError, setShowMealsError] = useState(false);
  const [showCookingLoadError, setShowCookingLoadError] = useState(false);
  const [showRepeatModeError, setShowRepeatModeError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draft, setDraft] = useState<OnboardingDraft>(() =>
    loadOnboardingDraft(userId) ?? buildInitialOnboardingDraft(initialHousehold),
  );

  useEffect(() => {
    saveOnboardingDraft(draft, userId);
  }, [draft, userId]);

  function updateDraft(updates: Partial<OnboardingDraft>) {
    setDraft((current) => {
      const nextMemberCount = updates.memberCount ?? current.memberCount;

      return {
        ...current,
        ...updates,
        members:
          updates.memberCount !== undefined
            ? buildMembersForCount(nextMemberCount, current.members)
            : current.members,
      };
    });

    if (updates.householdName !== undefined && updates.householdName.trim()) {
      setShowHouseholdNameError(false);
    }

    if (updates.mealsPerDay !== undefined && updates.mealsPerDay.length > 0) {
      setShowMealsError(false);
    }

    if (updates.cookingLoad !== undefined && updates.cookingLoad !== "") {
      setShowCookingLoadError(false);
    }

    if (updates.repeatMode !== undefined && updates.repeatMode !== "") {
      setShowRepeatModeError(false);
    }
  }

  function updateMember(
    memberId: string,
    updates: Partial<OnboardingMemberDraft>,
  ) {
    setDraft((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === memberId ? { ...member, ...updates } : member,
      ),
    }));

    if (updates.name !== undefined && updates.name.trim()) {
      setShowMemberNameError(false);
    }

    if (updates.goal !== undefined && updates.goal !== "") {
      setShowMemberGoalError(false);
    }
  }

  function goNext() {
    if (currentStep === 0 && !canContinueFromHousehold) {
      setShowHouseholdNameError(true);
      document.getElementById("household-name")?.focus();
      return;
    }

    if (currentStep === 1 && !canContinueFromMembers) {
      setShowMemberNameError(true);
      document
        .getElementById(`member-name-${draft.members[safeCurrentMemberIndex]?.id}`)
        ?.focus();
      return;
    }

    if (currentStep === 1 && !canContinueFromMemberGoal) {
      setShowMemberGoalError(true);
      document
        .getElementById(`member-goal-${draft.members[safeCurrentMemberIndex]?.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (currentStep === 2 && !canContinueFromMeals) {
      setShowMealsError(true);
      document.getElementById("preferences-meals")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (currentStep === 2 && !canContinueFromCookingLoad) {
      setShowCookingLoadError(true);
      document.getElementById("preferences-cooking-load")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (currentStep === 2 && !canContinueFromRepeatMode) {
      setShowRepeatModeError(true);
      document.getElementById("preferences-repeat-mode")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (currentStep === 1 && safeCurrentMemberIndex < draft.memberCount - 1) {
      setShowMemberNameError(false);
      setShowMemberGoalError(false);
      setCurrentMemberIndex((index) => index + 1);
      return;
    }

    if (currentStep === 0) {
      setShowHouseholdNameError(false);
    }

    if (currentStep === 1) {
      setShowMemberNameError(false);
      setShowMemberGoalError(false);
    }

    if (currentStep === 2) {
      setShowMealsError(false);
      setShowCookingLoadError(false);
      setShowRepeatModeError(false);
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    if (currentStep === 1 && safeCurrentMemberIndex > 0) {
      setCurrentMemberIndex((index) => index - 1);
      return;
    }

    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  const safeCurrentMemberIndex = Math.min(
    currentMemberIndex,
    Math.max(draft.memberCount - 1, 0),
  );
  const canContinueFromMembers =
    draft.members[safeCurrentMemberIndex]?.name.trim();
  const canContinueFromMemberGoal =
    draft.members[safeCurrentMemberIndex]?.goal !== "";
  const canContinueFromHousehold = draft.householdName.trim().length > 0;
  const canContinueFromMeals = draft.mealsPerDay.length > 0;
  const canContinueFromCookingLoad = draft.cookingLoad !== "";
  const canContinueFromRepeatMode = draft.repeatMode !== "";

  async function handleComplete() {
    setIsSaving(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/household", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error("Failed to save household");
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setSubmitError(
        "No se ha podido guardar tu hogar. Revisa la conexion e intentalo de nuevo.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      {currentStep === 0 ? (
        <PageHeader
          eyebrow=""
          title="Conozcamos tu hogar"
          description="Cuentanos quienes sois y MenumIA preparara un plan de comidas que encaje con tu ritmo, ahorrando tiempo y dinero."
        />
      ) : null}

      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        labels={steps}
      />

      {currentStep === 0 ? (
        <HouseholdSizeStep
          draft={draft}
          onChange={updateDraft}
          showNameError={showHouseholdNameError}
        />
      ) : null}

      {currentStep === 1 ? (
        <MembersStep
          draft={draft}
          currentMemberIndex={safeCurrentMemberIndex}
          showNameError={showMemberNameError}
          showGoalError={showMemberGoalError}
          onMemberChange={updateMember}
        />
      ) : null}

      {currentStep === 2 ? (
        <PreferencesStep
          draft={draft}
          onChange={updateDraft}
          showMealsError={showMealsError}
          showCookingLoadError={showCookingLoadError}
          showRepeatModeError={showRepeatModeError}
        />
      ) : null}

      {currentStep === 3 ? (
        <OnboardingReview
          draft={draft}
          onComplete={handleComplete}
          isSubmitting={isSaving}
          submitError={submitError}
        />
      ) : null}

      {currentStep < steps.length - 1 ? (
        <StepActions
          canGoBack={currentStep > 0}
          onBack={goBack}
          primaryLabel={
            currentStep === steps.length - 2
              ? "✨ Finalizar configuracion"
              : "Continuar →"
          }
          primaryTone={currentStep === steps.length - 2 ? "subtle" : "solid"}
          onPrimary={goNext}
          primaryDisabled={false}
        />
      ) : null}
    </div>
  );
}
