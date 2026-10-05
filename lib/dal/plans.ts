import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { shoppingListStates, weekTemplates, weeklyPlans } from "@/db/schema";
import type {
  ShoppingListState,
  WeekTemplate,
  WeeklyPlan,
} from "@/lib/domain/types";

type PersistedWeekTemplateRecord = typeof weekTemplates.$inferSelect;
type PersistedWeeklyPlanRecord = typeof weeklyPlans.$inferSelect;
type PersistedShoppingListStateRecord = typeof shoppingListStates.$inferSelect;

export async function getWeekTemplateByHouseholdId(householdId: string) {
  const [template] = await db
    .select()
    .from(weekTemplates)
    .where(eq(weekTemplates.householdId, householdId))
    .orderBy(desc(weekTemplates.updatedAt));

  return template ? mapWeekTemplate(template) : null;
}

export async function saveWeekTemplate(template: WeekTemplate) {
  const [saved] = await db
    .insert(weekTemplates)
    .values({
      id: template.id,
      householdId: template.householdId,
      name: template.name,
      repeatable: template.repeatable,
      days: template.days,
      batchBlocks: template.batchBlocks,
      leftoverFlows: template.leftoverFlows,
    })
    .onConflictDoUpdate({
      target: weekTemplates.id,
      set: {
        householdId: template.householdId,
        name: template.name,
        repeatable: template.repeatable,
        days: template.days,
        batchBlocks: template.batchBlocks,
        leftoverFlows: template.leftoverFlows,
        updatedAt: new Date(),
      },
    })
    .returning();

  return mapWeekTemplate(saved);
}

export async function getLatestWeeklyPlanByHouseholdId(householdId: string) {
  const [plan] = await db
    .select()
    .from(weeklyPlans)
    .where(eq(weeklyPlans.householdId, householdId))
    .orderBy(desc(weeklyPlans.updatedAt));

  return plan ? mapWeeklyPlan(plan) : null;
}

export async function getWeeklyPlanByIdForHousehold(
  planId: string,
  householdId: string,
) {
  const [plan] = await db
    .select()
    .from(weeklyPlans)
    .where(
      and(eq(weeklyPlans.id, planId), eq(weeklyPlans.householdId, householdId)),
    );

  return plan ? mapWeeklyPlan(plan) : null;
}

export async function saveWeeklyPlan(plan: WeeklyPlan) {
  const [saved] = await db
    .insert(weeklyPlans)
    .values({
      id: plan.id,
      householdId: plan.householdId,
      templateId: plan.templateId ?? null,
      status: plan.status,
      planningStartMode: plan.planningStartMode,
      rangeStart: plan.rangeStart,
      rangeEnd: plan.rangeEnd,
      weekStart: plan.weekStart,
      days: plan.days,
      batchBlocks: plan.batchBlocks,
      leftoverFlows: plan.leftoverFlows,
      confirmedAt: plan.confirmedAt ?? null,
    })
    .onConflictDoUpdate({
      target: weeklyPlans.id,
      setWhere: eq(weeklyPlans.householdId, plan.householdId),
      set: {
        householdId: plan.householdId,
        templateId: plan.templateId ?? null,
        status: plan.status,
        planningStartMode: plan.planningStartMode,
        rangeStart: plan.rangeStart,
        rangeEnd: plan.rangeEnd,
        weekStart: plan.weekStart,
        days: plan.days,
        batchBlocks: plan.batchBlocks,
        leftoverFlows: plan.leftoverFlows,
        confirmedAt: plan.confirmedAt ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return saved ? mapWeeklyPlan(saved) : null;
}

export async function deleteWeeklyPlan(planId: string, householdId: string) {
  const [deleted] = await db
    .delete(weeklyPlans)
    .where(
      and(eq(weeklyPlans.id, planId), eq(weeklyPlans.householdId, householdId)),
    )
    .returning();

  return deleted ? mapWeeklyPlan(deleted) : null;
}

export async function getShoppingListState(planId: string) {
  const [state] = await db
    .select()
    .from(shoppingListStates)
    .where(eq(shoppingListStates.planId, planId));

  return state ? mapShoppingListState(state) : null;
}

export async function saveShoppingListState(state: ShoppingListState) {
  const [saved] = await db
    .insert(shoppingListStates)
    .values({
      planId: state.planId,
      items: state.items,
    })
    .onConflictDoUpdate({
      target: shoppingListStates.planId,
      set: {
        items: state.items,
        updatedAt: new Date(),
      },
    })
    .returning();

  return mapShoppingListState(saved);
}

function mapWeekTemplate(record: PersistedWeekTemplateRecord): WeekTemplate {
  return {
    id: record.id,
    householdId: record.householdId,
    name: record.name,
    repeatable: record.repeatable,
    days: record.days as WeekTemplate["days"],
    batchBlocks: record.batchBlocks as WeekTemplate["batchBlocks"],
    leftoverFlows: record.leftoverFlows as WeekTemplate["leftoverFlows"],
  };
}

function mapWeeklyPlan(record: PersistedWeeklyPlanRecord): WeeklyPlan {
  return {
    id: record.id,
    householdId: record.householdId,
    templateId: record.templateId ?? undefined,
    status: record.status as WeeklyPlan["status"],
    planningStartMode: record.planningStartMode as WeeklyPlan["planningStartMode"],
    rangeStart: record.rangeStart,
    rangeEnd: record.rangeEnd,
    weekStart: record.weekStart,
    days: record.days as WeeklyPlan["days"],
    batchBlocks: record.batchBlocks as WeeklyPlan["batchBlocks"],
    leftoverFlows: record.leftoverFlows as WeeklyPlan["leftoverFlows"],
    confirmedAt: record.confirmedAt ?? undefined,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapShoppingListState(
  record: PersistedShoppingListStateRecord,
): ShoppingListState {
  return {
    planId: record.planId,
    items: record.items as ShoppingListState["items"],
    updatedAt: record.updatedAt.toISOString(),
  };
}
