import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getHouseholdByOwnerUserId } from "@/lib/dal/households";
import { deleteWeeklyPlan, saveWeeklyPlan } from "@/lib/dal/plans";
import type { WeeklyPlan } from "@/lib/domain/types";
import { normalizeWeeklyPlan } from "@/lib/domain/weekly-plan-runtime";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const household = await getHouseholdByOwnerUserId(session.user.id);

  if (!household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  const payload = (await request.json()) as WeeklyPlan;

  if (!isValidWeeklyPlanPayload(payload, household.id)) {
    return NextResponse.json({ error: "Invalid weekly plan payload" }, { status: 400 });
  }

  const saved = await saveWeeklyPlan(normalizeWeeklyPlan(payload));
  return NextResponse.json({ plan: saved });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const household = await getHouseholdByOwnerUserId(session.user.id);

  if (!household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  await deleteWeeklyPlan(planId, household.id);
  return NextResponse.json({ ok: true });
}

function isValidWeeklyPlanPayload(
  value: unknown,
  householdId: string,
): value is WeeklyPlan {
  if (!value || typeof value !== "object") {
    return false;
  }

  const plan = value as Record<string, unknown>;

  return (
    typeof plan.id === "string" &&
    plan.householdId === householdId &&
    (plan.status === "draft" || plan.status === "confirmed") &&
    (plan.planningStartMode === "today" ||
      plan.planningStartMode === "next-monday") &&
    typeof plan.rangeStart === "string" &&
    typeof plan.rangeEnd === "string" &&
    typeof plan.weekStart === "string" &&
    Array.isArray(plan.days) &&
    Array.isArray(plan.batchBlocks) &&
    Array.isArray(plan.leftoverFlows) &&
    typeof plan.updatedAt === "string"
  );
}
