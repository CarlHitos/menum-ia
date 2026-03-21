import type { OnboardingDraft } from "@/features/onboarding/types";
import type { Goal, Household, MealType } from "@/lib/domain/types";

type PersistedHouseholdRecord = {
  id: string;
  name: string;
  preferredStore: string | null;
  weeklyBudget: number | null;
  cookingLoad: string | null;
  repeatMode: string | null;
  mealsPerDay: string[];
};

type PersistedHouseholdMemberRecord = {
  id: string;
  name: string;
  goal: string;
  allergies: string[];
  restrictions: string[];
  dislikes: string[];
  portionProfile: string | null;
  snackProfile: string | null;
};

export function buildDefaultOnboardingDraft(
  householdName = "",
): OnboardingDraft {
  return {
    householdName,
    memberCount: 2,
    members: [
      buildEmptyOnboardingMember("member-1"),
      buildEmptyOnboardingMember("member-2"),
    ],
    mealsPerDay: [],
    weeklyBudget: "",
    cookingLoad: "",
    preferredStore: "",
    repeatMode: "",
  };
}

export function buildHouseholdFromPersistence(
  household: PersistedHouseholdRecord,
  members: PersistedHouseholdMemberRecord[],
): Household {
  return {
    id: household.id,
    name: household.name,
    planningPreferences: {
      mealsPerDay: household.mealsPerDay as MealType[],
      weeklyBudget: household.weeklyBudget ?? undefined,
      cookingLoad: normalizeCookingLoad(household.cookingLoad),
      repeatMode: normalizeRepeatMode(household.repeatMode),
      preferredStores: household.preferredStore ? [household.preferredStore] : [],
    },
    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      goal: normalizeGoal(member.goal),
      restrictions: member.restrictions,
      allergies: member.allergies,
      dislikes: member.dislikes,
      portionProfile: normalizePortionProfile(member.portionProfile, member.goal),
      snackProfile: normalizeSnackProfile(member.snackProfile, member.goal),
    })),
  };
}

export function buildHouseholdPersistenceInput(
  ownerUserId: string,
  draft: OnboardingDraft,
) {
  return {
    ownerUserId,
    name: draft.householdName.trim() || "Mi hogar",
    preferredStore: normalizeNullableText(draft.preferredStore),
    weeklyBudget: parseWeeklyBudget(draft.weeklyBudget),
    cookingLoad: resolveCookingLoad(draft.cookingLoad),
    repeatMode: resolveRepeatMode(draft.repeatMode),
    mealsPerDay: draft.mealsPerDay,
  };
}

export function buildHouseholdMemberPersistenceInput(draft: OnboardingDraft) {
  return draft.members.map((member, index) => ({
    name: member.name.trim() || `Miembro ${index + 1}`,
    goal: resolveGoal(member.goal),
    allergies: splitListField(member.allergies),
    restrictions: splitListField(member.restrictions),
    dislikes: splitListField(member.dislikes),
    portionProfile: derivePortionProfile(resolveGoal(member.goal)),
    snackProfile: deriveSnackProfile(resolveGoal(member.goal)),
    sortOrder: index,
  }));
}

function buildEmptyOnboardingMember(id: string) {
  return {
    id,
    name: "",
    goal: "" as const,
    allergies: "",
    restrictions: "",
    dislikes: "",
  };
}

function normalizeNullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function splitListField(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseWeeklyBudget(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

function resolveGoal(value: Goal | ""): Goal {
  return value === "" ? "maintain" : value;
}

function resolveCookingLoad(value: OnboardingDraft["cookingLoad"]) {
  return value === "" ? "medium" : value;
}

function resolveRepeatMode(value: OnboardingDraft["repeatMode"]) {
  return value === "" ? "repeat-base-week" : value;
}

function normalizeGoal(value: string): Goal {
  if (
    value === "gain" ||
    value === "lose" ||
    value === "maintain" ||
    value === "eat-better"
  ) {
    return value;
  }

  return "maintain";
}

function normalizeCookingLoad(value: string | null) {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}

function normalizeRepeatMode(value: string | null) {
  return value === "vary-week" ? "vary-week" : "repeat-base-week";
}

function derivePortionProfile(goal: Goal) {
  switch (goal) {
    case "gain":
      return "large";
    case "lose":
      return "small";
    default:
      return "medium";
  }
}

function deriveSnackProfile(goal: Goal) {
  switch (goal) {
    case "gain":
      return "extra";
    default:
      return "standard";
  }
}

function normalizePortionProfile(value: string | null, goal: string) {
  if (value === "small" || value === "medium" || value === "large") {
    return value;
  }

  return derivePortionProfile(normalizeGoal(goal));
}

function normalizeSnackProfile(value: string | null, goal: string) {
  if (value === "none" || value === "standard" || value === "extra") {
    return value;
  }

  return deriveSnackProfile(normalizeGoal(goal));
}
