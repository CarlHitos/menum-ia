import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { householdMembers, households } from "@/db/schema";

export type CreateHouseholdInput = {
  ownerUserId: string;
  name: string;
  preferredStore?: string | null;
  weeklyBudget?: number | null;
  cookingLoad?: string | null;
  repeatMode?: string | null;
  mealsPerDay: string[];
};

export type CreateHouseholdMemberInput = {
  name: string;
  goal: string;
  allergies: string[];
  restrictions: string[];
  dislikes: string[];
  portionProfile?: string | null;
  snackProfile?: string | null;
  sortOrder: number;
};

export async function getHouseholdByOwnerUserId(ownerUserId: string) {
  const [household] = await db
    .select()
    .from(households)
    .where(eq(households.ownerUserId, ownerUserId));

  return household ?? null;
}

export async function getHouseholdWithMembersByOwnerUserId(ownerUserId: string) {
  const household = await getHouseholdByOwnerUserId(ownerUserId);

  if (!household) {
    return null;
  }

  const members = await db
    .select()
    .from(householdMembers)
    .where(eq(householdMembers.householdId, household.id))
    .orderBy(asc(householdMembers.sortOrder));

  return {
    household,
    members,
  };
}

export async function createHousehold(input: CreateHouseholdInput) {
  const [household] = await db
    .insert(households)
    .values({
      ownerUserId: input.ownerUserId,
      name: input.name,
      preferredStore: input.preferredStore ?? null,
      weeklyBudget: input.weeklyBudget ?? null,
      cookingLoad: input.cookingLoad ?? null,
      repeatMode: input.repeatMode ?? null,
      mealsPerDay: input.mealsPerDay,
    })
    .returning();

  return household;
}

export async function replaceHouseholdMembers(
  householdId: string,
  members: CreateHouseholdMemberInput[],
) {
  await db
    .delete(householdMembers)
    .where(eq(householdMembers.householdId, householdId));

  if (members.length === 0) {
    return [];
  }

  return db
    .insert(householdMembers)
    .values(
      members.map((member) => ({
        householdId,
        name: member.name,
        goal: member.goal,
        allergies: member.allergies,
        restrictions: member.restrictions,
        dislikes: member.dislikes,
        portionProfile: member.portionProfile ?? null,
        snackProfile: member.snackProfile ?? null,
        sortOrder: member.sortOrder,
      })),
    )
    .returning();
}

export async function updateHouseholdBasics(
  householdId: string,
  ownerUserId: string,
  input: Omit<CreateHouseholdInput, "ownerUserId">,
) {
  const [household] = await db
    .update(households)
    .set({
      name: input.name,
      preferredStore: input.preferredStore ?? null,
      weeklyBudget: input.weeklyBudget ?? null,
      cookingLoad: input.cookingLoad ?? null,
      repeatMode: input.repeatMode ?? null,
      mealsPerDay: input.mealsPerDay,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(households.id, householdId),
        eq(households.ownerUserId, ownerUserId),
      ),
    )
    .returning();

  return household ?? null;
}
