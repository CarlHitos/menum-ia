import assert from "node:assert/strict";
import test from "node:test";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { createSessionCallbacks } from "../lib/auth/session-validation";
import {
  clearOnboardingState,
  loadOnboardingDraft,
} from "../lib/local-storage/onboarding-storage";

type Callbacks = ReturnType<typeof createSessionCallbacks>;

async function readSession(callbacks: Callbacks, token: JWT) {
  const checkedToken = await callbacks.jwt({
    token,
    account: null,
    user: { id: token.sub ?? "" },
  });
  // NextAuth's callback type also includes the database-session variant;
  // this application always invokes it with the JWT-session arguments.
  const session = await callbacks.session({
    session: {
      user: { name: "Test", email: "test@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    },
    token: checkedToken,
  } as Parameters<Callbacks["session"]>[0]);
  return { token: checkedToken, session: session as Session };
}

test("an existing account retains its authenticated identity", async () => {
  const callbacks = createSessionCallbacks(async (id) => ({ id }));
  const { session } = await readSession(callbacks, { sub: "existing-user" });
  assert.equal(session.user?.id, "existing-user");
  assert.equal(session.user?.email, "test@example.com");
  assert.equal(session.invalidUserId, undefined);
});

test("deleting an account rejects its previously valid JWT on the next read", async () => {
  let exists = true;
  const callbacks = createSessionCallbacks(async (id) => exists ? { id } : null);
  const first = await readSession(callbacks, { sub: "deleted-user" });
  assert.equal(first.session.user?.id, "deleted-user");
  exists = false;
  const second = await readSession(callbacks, first.token);
  assert.equal(second.token.sub, undefined);
  assert.equal(second.session.user, undefined);
  assert.equal(second.session.invalidUserId, "deleted-user");
  assert.equal("email" in second.session, false);
});

test("a new account with the same email cannot revive the old session", async () => {
  const callbacks = createSessionCallbacks(async (id) => id === "new-user" ? { id } : null);
  const old = await readSession(callbacks, { sub: "old-user", email: "same@example.com" });
  assert.equal(old.session.user, undefined);
  const fresh = await readSession(callbacks, { sub: "new-user", email: "same@example.com" });
  assert.equal(fresh.session.user?.id, "new-user");
});

test("a revoked token stays rejected without another database lookup", async () => {
  const callbacks = createSessionCallbacks(async () => {
    assert.fail("revoked tokens must not be authenticated again");
  });
  const { session, token } = await readSession(callbacks, {
    sub: "deleted-user",
    invalidUserId: "deleted-user",
  });
  assert.equal(token.sub, undefined);
  assert.equal(session.user, undefined);
  assert.equal(session.invalidUserId, "deleted-user");
});

test("a token without an identity never creates an authenticated session", async () => {
  const callbacks = createSessionCallbacks(async () => assert.fail("missing identity"));
  const { session } = await readSession(callbacks, {});
  assert.equal(session.user, undefined);
  assert.equal(session.invalidUserId, undefined);
});

test("database errors fail closed without reporting the account as deleted", async () => {
  const token = { sub: "existing-user" };
  const callbacks = createSessionCallbacks(async () => {
    throw new Error("Database unavailable");
  });
  await assert.rejects(readSession(callbacks, token), /Database unavailable/);
  assert.deepEqual(token, { sub: "existing-user" });
});

test("cleanup removes only the deleted account's onboarding data", () => {
  const storage = new Map<string, string>();
  for (const user of ["deleted-user", "other-user"]) {
    for (const version of [1, 2, 3]) {
      storage.set(`menumia:onboarding:v${version}:${user}`, "draft");
    }
    storage.set(`menumia:onboarding-complete:v1:${user}`, "true");
  }
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
      },
    },
  });
  try {
    clearOnboardingState("deleted-user");
    assert.equal(loadOnboardingDraft("deleted-user"), null);
    assert.equal(storage.size, 4);
    assert.ok([...storage.keys()].every((key) => key.endsWith(":other-user")));
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
