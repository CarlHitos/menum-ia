import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compoundKey: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compoundKey: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const households = pgTable("households", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  preferredStore: text("preferred_store"),
  weeklyBudget: integer("weekly_budget"),
  cookingLoad: text("cooking_load"),
  repeatMode: text("repeat_mode"),
  mealsPerDay: jsonb("meals_per_day").notNull().$type<string[]>(),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const householdMembers = pgTable("household_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  householdId: text("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  allergies: jsonb("allergies").notNull().$type<string[]>(),
  restrictions: jsonb("restrictions").notNull().$type<string[]>(),
  dislikes: jsonb("dislikes").notNull().$type<string[]>(),
  portionProfile: text("portion_profile"),
  snackProfile: text("snack_profile"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const weekTemplates = pgTable("week_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  householdId: text("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  repeatable: boolean("repeatable").default(true).notNull(),
  days: jsonb("days").notNull(),
  batchBlocks: jsonb("batch_blocks").notNull(),
  leftoverFlows: jsonb("leftover_flows").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const weeklyPlans = pgTable("weekly_plans", {
  id: text("id").primaryKey(),
  householdId: text("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  templateId: text("template_id").references(() => weekTemplates.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull(),
  planningStartMode: text("planning_start_mode").notNull(),
  rangeStart: text("range_start").notNull(),
  rangeEnd: text("range_end").notNull(),
  weekStart: text("week_start").notNull(),
  days: jsonb("days").notNull(),
  batchBlocks: jsonb("batch_blocks").notNull(),
  leftoverFlows: jsonb("leftover_flows").notNull(),
  confirmedAt: text("confirmed_at"),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const shoppingListStates = pgTable("shopping_list_states", {
  planId: text("plan_id")
    .primaryKey()
    .references(() => weeklyPlans.id, { onDelete: "cascade" }),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const recipes = pgTable("recipes", {
  catalogMetadata: jsonb("catalog_metadata").$type<import("@/lib/domain/types").RecipeCatalogMetadata>(),
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  difficulty: text("difficulty").notNull(),
  baseServings: integer("base_servings").notNull(),
  utensils: jsonb("utensils").notNull().$type<string[]>(),
  ingredients: jsonb("ingredients").notNull(),
  steps: jsonb("steps").notNull(),
  substitutions: jsonb("substitutions").notNull().$type<string[]>(),
  portionAdjustments: jsonb("portion_adjustments").notNull(),
  batchCookingNotes: text("batch_cooking_notes"),
  leftoverNotes: text("leftover_notes"),
  quickDinner: boolean("quick_dinner"),
  baseYield: jsonb("base_yield"),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});
