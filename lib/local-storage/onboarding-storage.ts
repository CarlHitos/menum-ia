import { isMealType } from "@/lib/domain/meal-types";
import type { OnboardingDraft } from "@/features/onboarding/types";

const STORAGE_KEY_V3 = "menumia:onboarding:v3";
const STORAGE_KEY_V2 = "menumia:onboarding:v2";
const STORAGE_KEY_V1 = "menumia:onboarding:v1";
const COMPLETION_KEY_V1 = "menumia:onboarding-complete:v1";
const DEFAULT_MEALS_PER_DAY: OnboardingDraft["mealsPerDay"] = [
  "breakfast",
  "lunch",
  "snack",
  "dinner",
];

function getStorageKey(baseKey: string, userId?: string) {
  return userId ? `${baseKey}:${userId}` : baseKey;
}

type V2OnboardingDraft = Omit<OnboardingDraft, "mealsPerDay">;

type LegacyOnboardingMemberDraft = {
  id: string;
  name: string;
  goal: OnboardingDraft["members"][number]["goal"];
  restrictions: string;
  dislikes: string;
};

type LegacyOnboardingDraft = {
  householdName: string;
  memberCount: number;
  members: LegacyOnboardingMemberDraft[];
  weeklyBudget: string;
  cookingLoad: "low" | "medium" | "high";
  preferredStore: string;
  repeatMode: "repeat-base-week" | "vary-week";
};

function isValidOnboardingDraft(value: unknown): value is OnboardingDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    typeof draft.householdName === "string" &&
    typeof draft.memberCount === "number" &&
    Array.isArray(draft.members) &&
    draft.members.every(isValidOnboardingMemberDraft) &&
    Array.isArray(draft.mealsPerDay) &&
    draft.mealsPerDay.every(isMealType) &&
    typeof draft.weeklyBudget === "string" &&
    typeof draft.cookingLoad === "string" &&
    typeof draft.preferredStore === "string" &&
    typeof draft.repeatMode === "string"
  );
}

function isValidOnboardingMemberDraft(value: unknown): value is OnboardingDraft["members"][number] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const member = value as Record<string, unknown>;

  return (
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    typeof member.goal === "string" &&
    typeof member.allergies === "string" &&
    typeof member.restrictions === "string" &&
    typeof member.dislikes === "string"
  );
}

function isValidV2OnboardingDraft(value: unknown): value is V2OnboardingDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    typeof draft.householdName === "string" &&
    typeof draft.memberCount === "number" &&
    Array.isArray(draft.members) &&
    draft.members.every(isValidOnboardingMemberDraft) &&
    typeof draft.weeklyBudget === "string" &&
    typeof draft.cookingLoad === "string" &&
    typeof draft.preferredStore === "string" &&
    typeof draft.repeatMode === "string"
  );
}

function isValidLegacyOnboardingDraft(value: unknown): value is LegacyOnboardingDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    typeof draft.householdName === "string" &&
    typeof draft.memberCount === "number" &&
    Array.isArray(draft.members) &&
    draft.members.every(isValidLegacyOnboardingMemberDraft) &&
    typeof draft.weeklyBudget === "string" &&
    typeof draft.cookingLoad === "string" &&
    typeof draft.preferredStore === "string" &&
    typeof draft.repeatMode === "string"
  );
}

function isValidLegacyOnboardingMemberDraft(
  value: unknown,
): value is LegacyOnboardingMemberDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const member = value as Record<string, unknown>;

  return (
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    typeof member.goal === "string" &&
    typeof member.restrictions === "string" &&
    typeof member.dislikes === "string"
  );
}

function normalizeLegacyDraft(draft: LegacyOnboardingDraft): OnboardingDraft {
  return {
    ...draft,
    members: draft.members.map((member) => ({
      ...member,
      allergies: "",
    })),
    mealsPerDay: DEFAULT_MEALS_PER_DAY,
  };
}

export function loadOnboardingDraft(userId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const currentRaw = window.localStorage.getItem(
      getStorageKey(STORAGE_KEY_V3, userId),
    );

    if (currentRaw) {
      const parsed = JSON.parse(currentRaw);
      return isValidOnboardingDraft(parsed) ? parsed : null;
    }

    const v2Raw = window.localStorage.getItem(
      getStorageKey(STORAGE_KEY_V2, userId),
    );

    if (v2Raw) {
      const parsed = JSON.parse(v2Raw);

      if (!isValidV2OnboardingDraft(parsed)) {
        return null;
      }

      const normalizedDraft: OnboardingDraft = {
        ...parsed,
        mealsPerDay: DEFAULT_MEALS_PER_DAY,
      };
      saveOnboardingDraft(normalizedDraft, userId);
      return normalizedDraft;
    }

    const legacyRaw = window.localStorage.getItem(
      getStorageKey(STORAGE_KEY_V1, userId),
    );

    if (!legacyRaw) {
      return null;
    }

    const parsed = JSON.parse(legacyRaw);

    if (!isValidLegacyOnboardingDraft(parsed)) {
      return null;
    }

    const normalizedDraft = normalizeLegacyDraft(parsed);
    saveOnboardingDraft(normalizedDraft, userId);
    return normalizedDraft;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft, userId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(STORAGE_KEY_V3, userId),
      JSON.stringify(draft),
    );
  } catch {
    // Ignore storage failures and keep local state working.
  }
}

export function clearOnboardingDraft(userId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(getStorageKey(STORAGE_KEY_V3, userId));
    window.localStorage.removeItem(getStorageKey(STORAGE_KEY_V2, userId));
    window.localStorage.removeItem(getStorageKey(STORAGE_KEY_V1, userId));
  } catch {
    // Ignore storage failures.
  }
}

export function isOnboardingComplete(userId?: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(getStorageKey(COMPLETION_KEY_V1, userId)) ===
      "true"
    );
  } catch {
    return false;
  }
}

export function setOnboardingComplete(
  completed: boolean,
  userId?: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(COMPLETION_KEY_V1, userId),
      completed ? "true" : "false",
    );
  } catch {
    // Ignore storage failures.
  }
}
