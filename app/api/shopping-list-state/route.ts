import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getHouseholdByOwnerUserId } from "@/lib/dal/households";
import {
  getWeeklyPlanByIdForHousehold,
  saveShoppingListState,
} from "@/lib/dal/plans";
import type { ShoppingListState } from "@/lib/domain/types";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const household = await getHouseholdByOwnerUserId(session.user.id);

  if (!household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  const payload = (await request.json()) as ShoppingListState;

  if (!isValidShoppingListState(payload)) {
    return NextResponse.json(
      { error: "Invalid shopping list state payload" },
      { status: 400 },
    );
  }

  const plan = await getWeeklyPlanByIdForHousehold(payload.planId, household.id);

  if (!plan) {
    return NextResponse.json({ error: "Weekly plan not found" }, { status: 404 });
  }

  const saved = await saveShoppingListState(payload);
  return NextResponse.json({ state: saved });
}

function isValidShoppingListState(value: unknown): value is ShoppingListState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Record<string, unknown>;

  return (
    typeof state.planId === "string" &&
    Array.isArray(state.items) &&
    typeof state.updatedAt === "string"
  );
}
