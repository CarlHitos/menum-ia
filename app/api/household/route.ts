import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import {
  createHousehold,
  getHouseholdByOwnerUserId,
  replaceHouseholdMembers,
  updateHouseholdBasics,
} from "@/lib/dal/households";
import {
  buildHouseholdMemberPersistenceInput,
  buildHouseholdPersistenceInput,
} from "@/lib/domain/household-mappers";
import type { OnboardingDraft } from "@/features/onboarding/types";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft = (await request.json()) as OnboardingDraft;

  if (!isValidOnboardingDraftPayload(draft)) {
    return NextResponse.json({ error: "Invalid onboarding payload" }, { status: 400 });
  }

  const householdInput = buildHouseholdPersistenceInput(session.user.id, draft);
  const existingHousehold = await getHouseholdByOwnerUserId(session.user.id);

  const household = existingHousehold
    ? await updateHouseholdBasics(existingHousehold.id, session.user.id, {
        name: householdInput.name,
        preferredStore: householdInput.preferredStore,
        weeklyBudget: householdInput.weeklyBudget,
        cookingLoad: householdInput.cookingLoad,
        repeatMode: householdInput.repeatMode,
        mealsPerDay: householdInput.mealsPerDay,
      })
    : await createHousehold(householdInput);

  if (!household) {
    return NextResponse.json({ error: "Unable to save household" }, { status: 500 });
  }

  await replaceHouseholdMembers(
    household.id,
    buildHouseholdMemberPersistenceInput(draft),
  );

  return NextResponse.json({ ok: true, householdId: household.id });
}

function isValidOnboardingDraftPayload(value: unknown): value is OnboardingDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    typeof draft.householdName === "string" &&
    draft.householdName.trim().length > 0 &&
    typeof draft.memberCount === "number" &&
    Array.isArray(draft.members) &&
    draft.members.every(
      (member) =>
        member &&
        typeof member === "object" &&
        typeof member.name === "string" &&
        member.name.trim().length > 0 &&
        (member.goal === "gain" ||
          member.goal === "lose" ||
          member.goal === "maintain" ||
          member.goal === "eat-better"),
    ) &&
    Array.isArray(draft.mealsPerDay) &&
    draft.mealsPerDay.length > 0 &&
    typeof draft.weeklyBudget === "string" &&
    (draft.cookingLoad === "low" ||
      draft.cookingLoad === "medium" ||
      draft.cookingLoad === "high") &&
    typeof draft.preferredStore === "string" &&
    (draft.repeatMode === "repeat-base-week" ||
      draft.repeatMode === "vary-week")
  );
}
