"use client";

import { useEffect, useState } from "react";
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
  initialHousehold: Household;
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
        restrictions: "",
        dislikes: "",
      }
    );
  });
}

export function OnboardingFlow({ initialHousehold }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() =>
    loadOnboardingDraft() ?? buildInitialOnboardingDraft(initialHousehold),
  );

  useEffect(() => {
    saveOnboardingDraft(draft);
  }, [draft]);

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
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  const canContinueFromMembers = draft.members.every((member) => member.name.trim());

  return (
    <div>
      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        labels={steps}
      />

      {currentStep === 0 ? (
        <HouseholdSizeStep draft={draft} onChange={updateDraft} />
      ) : null}

      {currentStep === 1 ? (
        <MembersStep draft={draft} onMemberChange={updateMember} />
      ) : null}

      {currentStep === 2 ? (
        <PreferencesStep draft={draft} onChange={updateDraft} />
      ) : null}

      {currentStep === 3 ? <OnboardingReview draft={draft} /> : null}

      {currentStep < steps.length - 1 ? (
        <StepActions
          canGoBack={currentStep > 0}
          onBack={goBack}
          primaryLabel={currentStep === steps.length - 2 ? "Ver resumen" : "Continuar"}
          onPrimary={goNext}
          primaryDisabled={currentStep === 1 ? !canContinueFromMembers : false}
        />
      ) : null}
    </div>
  );
}
