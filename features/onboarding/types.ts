import type { Goal, MealType } from "@/lib/domain/types";

export type OnboardingMemberDraft = {
  id: string;
  name: string;
  goal: Goal;
  allergies: string;
  restrictions: string;
  dislikes: string;
};

export type OnboardingDraft = {
  householdName: string;
  memberCount: number;
  members: OnboardingMemberDraft[];
  mealsPerDay: MealType[];
  weeklyBudget: string;
  cookingLoad: "low" | "medium" | "high";
  preferredStore: string;
  repeatMode: "repeat-base-week" | "vary-week";
};
