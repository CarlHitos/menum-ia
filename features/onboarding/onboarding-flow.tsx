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
        goal: "maintain",
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
  }

  function goNext() {
    if (currentStep === 1 && safeCurrentMemberIndex < draft.memberCount - 1) {
      setCurrentMemberIndex((index) => index + 1);
      return;
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
        "No se ha podido guardar vuestro hogar. Revisad la conexion e intentadlo de nuevo.",
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
          title="Conozcamos vuestra mesa"
          description="Dinos quiénes sois y MenumIA creará un plan de comidas que se adapte perfectamente a todos, ahorrando tiempo y dinero."
        />
      ) : null}

      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        labels={steps}
      />

      {currentStep === 0 ? (
        <HouseholdSizeStep draft={draft} onChange={updateDraft} />
      ) : null}

      {currentStep === 1 ? (
        <MembersStep
          draft={draft}
          currentMemberIndex={safeCurrentMemberIndex}
          onMemberChange={updateMember}
        />
      ) : null}

      {currentStep === 2 ? (
        <PreferencesStep draft={draft} onChange={updateDraft} />
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
          primaryDisabled={currentStep === 1 ? !canContinueFromMembers : false}
        />
      ) : null}
    </div>
  );
}
