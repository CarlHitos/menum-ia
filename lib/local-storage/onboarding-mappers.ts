import type { OnboardingDraft } from "@/features/onboarding/types";
import type { Household } from "@/lib/domain/types";

export function buildInitialOnboardingDraft(household: Household): OnboardingDraft {
  return {
    householdName: household.name,
    memberCount: household.members.length,
    members: household.members.map((member) => ({
      id: member.id,
      name: member.name,
      goal: member.goal,
      restrictions: member.restrictions.join(", "),
      dislikes: member.dislikes.join(", "),
    })),
    weeklyBudget: `${household.planningPreferences.weeklyBudget ?? ""} EUR`,
    cookingLoad: household.planningPreferences.cookingLoad,
    preferredStore: household.planningPreferences.preferredStores[0] ?? "",
    repeatMode: household.planningPreferences.repeatMode,
  };
}

export function buildDashboardContext(
  draft: OnboardingDraft | null,
  fallbackHousehold: Household,
) {
  const source = draft ?? buildInitialOnboardingDraft(fallbackHousehold);
  const memberNames = source.members
    .map((member) => member.name.trim())
    .filter(Boolean);
  const goals = Array.from(new Set(source.members.map((member) => member.goal)));

  const goalSummary =
    goals.length === 1
      ? `Objetivo compartido: ${formatGoal(goals[0])}`
      : `Objetivos mixtos: ${goals.map(formatGoal).join(", ")}`;

  return {
    householdName: source.householdName || fallbackHousehold.name,
    memberNames,
    memberSummary:
      memberNames.length > 0 ? memberNames.join(", ") : "Hogar en configuracion",
    goalSummary,
    cookingLoadLabel: formatCookingLoad(source.cookingLoad),
    repeatLabel:
      source.repeatMode === "repeat-base-week"
        ? "Semana base repetible"
        : "Semana variable",
    preferredStore: source.preferredStore || fallbackHousehold.planningPreferences.preferredStores[0] || "No definido",
    contextualTitle: `Menu semanal para ${source.householdName || fallbackHousehold.name}`,
    contextualDescription: `Base comun para ${source.memberCount} personas, ajustada a ${goalSummary.toLowerCase()}.`,
  };
}

function formatGoal(goal: string) {
  switch (goal) {
    case "gain":
      return "ganar masa";
    case "lose":
      return "perder grasa";
    case "maintain":
      return "mantener";
    case "eat-better":
      return "comer mejor";
    default:
      return goal;
  }
}

function formatCookingLoad(value: string) {
  switch (value) {
    case "low":
      return "Muy poco tiempo";
    case "medium":
      return "30 min aprox.";
    case "high":
      return "Mas margen para cocinar";
    default:
      return value;
  }
}
