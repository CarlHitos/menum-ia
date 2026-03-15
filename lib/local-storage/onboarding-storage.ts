import type { OnboardingDraft } from "@/features/onboarding/types";

const STORAGE_KEY = "menumia:onboarding:v1";

function isValidOnboardingDraft(value: unknown): value is OnboardingDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    typeof draft.householdName === "string" &&
    typeof draft.memberCount === "number" &&
    Array.isArray(draft.members) &&
    typeof draft.weeklyBudget === "string" &&
    typeof draft.cookingLoad === "string" &&
    typeof draft.preferredStore === "string" &&
    typeof draft.repeatMode === "string"
  );
}

export function loadOnboardingDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return isValidOnboardingDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage failures and keep local state working.
  }
}

export function clearOnboardingDraft() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
