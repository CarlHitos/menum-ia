import type { Goal } from "@/lib/domain/types";

export type OnboardingMemberDraft = {
  id: string;
  name: string;
  goal: Goal;
  restrictions: string;
  dislikes: string;
};

export type OnboardingDraft = {
  householdName: string;
  memberCount: number;
  members: OnboardingMemberDraft[];
  weeklyBudget: string;
  cookingLoad: "low" | "medium" | "high";
  preferredStore: string;
  repeatMode: "repeat-base-week" | "vary-week";
};
