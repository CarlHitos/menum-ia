import assert from "node:assert/strict";
import test from "node:test";
import { focusStepStart } from "../lib/ui/step-navigation";
import { getDefaultMenuDay, menuViewKey, readMenuDay, rememberMenuDay, rememberMenuPosition, takeMenuPosition } from "../lib/ui/menu-navigation";
import { buildDefaultWeekTemplate } from "../lib/domain/default-week-template";
import { buildActivePlanFromTemplate } from "../lib/domain/weekly-plan-runtime";

test("menu opens today only within the plan's actual dates, including weeks that start midweek", () => {
  const plan = buildActivePlanFromTemplate(buildDefaultWeekTemplate("house", 1), {
    householdId: "house", planningStartMode: "today", referenceDate: new Date(2026, 9, 15, 12),
  });
  assert.equal(getDefaultMenuDay(plan, new Date(2026, 9, 15, 0, 1)), "thursday");
  assert.equal(getDefaultMenuDay(plan, new Date(2026, 9, 19, 12)), "monday");
  assert.equal(getDefaultMenuDay(plan, new Date(2026, 9, 21, 23, 59)), "wednesday");
  assert.equal(getDefaultMenuDay(plan, new Date(2026, 9, 14, 12)), "thursday");
  assert.equal(getDefaultMenuDay(plan, new Date(2026, 9, 22, 12)), "thursday");
  assert.equal(getDefaultMenuDay({ ...plan, days: [] }), "");
});

test("returning to a recipe's menu restores its day and one-shot position without leaking between households or weeks", () => {
  const entries = new Map<string, string>();
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    scrollY: 420,
    sessionStorage: { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => entries.set(key, value), removeItem: (key: string) => entries.delete(key) },
  } });
  try {
    const key = menuViewKey("house-a", "week-a");
    rememberMenuDay(key, "thursday");
    rememberMenuPosition(key);
    assert.equal(readMenuDay(key, ["monday", "thursday"], "monday"), "monday");
    assert.equal(readMenuDay(key, ["monday", "thursday"], "monday", true), "thursday");
    assert.equal(takeMenuPosition(key), 420);
    assert.equal(takeMenuPosition(key), null);
    assert.equal(readMenuDay(menuViewKey("house-b", "week-a"), ["monday", "thursday"], "monday", true), "monday");
    assert.equal(readMenuDay(menuViewKey("house-a", "week-b"), ["monday", "thursday"], "monday", true), "monday");
    assert.equal(readMenuDay(key, ["monday"], "monday", true), "monday");
    for (const invalid of ["NaN", "Infinity", "-1", ""]) {
      entries.set(`${key}:return-scroll`, invalid);
      assert.equal(takeMenuPosition(key), null);
    }
    Object.defineProperty(window, "sessionStorage", { get() { throw new Error("Storage blocked"); } });
    assert.doesNotThrow(() => rememberMenuDay(key, "monday"));
    assert.doesNotThrow(() => rememberMenuPosition(key));
    assert.equal(readMenuDay(key, ["monday"], "monday", true), "monday");
    assert.equal(takeMenuPosition(key), null);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("step navigation focuses content before scrolling and respects reduced motion without focusing a text field", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let reducedMotion = true;
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: reducedMotion }) } });
  const calls: unknown[] = [];
  const heading = { focus: (options: unknown) => calls.push(["focus", options]), scrollIntoView: (options: unknown) => calls.push(["scroll", options]) };
  try {
    focusStepStart(heading);
    assert.deepEqual(calls, [["focus", { preventScroll: true }], ["scroll", { behavior: "instant", block: "start" }]]);
    reducedMotion = false;
    calls.length = 0;
    focusStepStart(heading);
    assert.deepEqual(calls[1], ["scroll", { behavior: "smooth", block: "start" }]);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
