import assert from "node:assert/strict";
import test from "node:test";
import {
  applyLocalChatGPTHeaders,
  handleLocalChatGPTAuth,
  isAppOwnedAuthHost,
  isLoopbackHost,
  LOCAL_PREVIEW_USER,
  LOCAL_USER_COOKIE,
  parseLocalUser,
  readLocalUserFromCookie,
  safeRelativeReturnPath,
  serializeLocalUser,
  USER_EMAIL_HEADER,
} from "../app/lib/local-chatgpt-auth";

test("isLoopbackHost accepts localhost variants only", () => {
  assert.equal(isLoopbackHost("localhost:3001"), true);
  assert.equal(isLoopbackHost("127.0.0.1"), true);
  assert.equal(isLoopbackHost("[::1]:3001"), true);
  assert.equal(isLoopbackHost("app.localhost"), true);
  assert.equal(isLoopbackHost("anatomy-blush.vercel.app"), false);
  assert.equal(isLoopbackHost("chatgpt.com"), false);
});

test("safeRelativeReturnPath rejects reserved and off-site targets", () => {
  assert.equal(safeRelativeReturnPath("/en"), "/en");
  assert.equal(safeRelativeReturnPath("/signin-with-chatgpt"), "/");
  assert.equal(safeRelativeReturnPath("//evil.test"), "/");
  assert.equal(safeRelativeReturnPath("https://evil.test/en"), "/");
});

test("parseLocalUser rejects malformed cookies", () => {
  assert.deepEqual(parseLocalUser(serializeLocalUser(LOCAL_PREVIEW_USER)), LOCAL_PREVIEW_USER);
  assert.equal(parseLocalUser("not-an-email|Name"), null);
  assert.equal(parseLocalUser("user@test.com"), null);
});

test("isAppOwnedAuthHost allows Vercel but not ChatGPT Sites", () => {
  assert.equal(isAppOwnedAuthHost("anatomy-omega-three.vercel.app"), true);
  assert.equal(isAppOwnedAuthHost("anatomy-atelier.openai.site"), false);
  assert.equal(isAppOwnedAuthHost("anatomy-atelier.openai.chatgpt.site"), false);
});

test("handleLocalChatGPTAuth sends app-owned hosts to continue, not Sites", () => {
  const local = handleLocalChatGPTAuth(
    new Request("http://localhost:3001/signin-with-chatgpt?return_to=%2Fen"),
  );
  assert.ok(local);
  assert.equal(local.status, 302);
  assert.equal(new URL(local.headers.get("Location") ?? "").pathname, "/en/auth/continue");

  const vercel = handleLocalChatGPTAuth(
    new Request("https://anatomy-omega-three.vercel.app/signin-with-chatgpt?return_to=%2Fen"),
  );
  assert.ok(vercel);
  assert.equal(new URL(vercel.headers.get("Location") ?? "").pathname, "/en/auth/continue");

  const sites = handleLocalChatGPTAuth(
    new Request("https://anatomy-atelier.openai.chatgpt.site/signin-with-chatgpt?return_to=%2Fen"),
  );
  assert.equal(sites, null);
});

test("sign-out on app-owned hosts returns to login, not the studio", () => {
  const local = handleLocalChatGPTAuth(
    new Request("http://localhost:3001/signout-with-chatgpt?return_to=%2Fen"),
  );
  assert.ok(local);
  assert.equal(local.status, 302);
  const location = new URL(local.headers.get("Location") ?? "");
  assert.equal(location.pathname, "/en/auth/continue");
  assert.match(local.headers.get("Set-Cookie") ?? "", /anatomy_local_chatgpt=;/);

  const sites = handleLocalChatGPTAuth(
    new Request("https://anatomy-atelier.openai.chatgpt.site/signout-with-chatgpt?return_to=%2Fen"),
  );
  assert.equal(sites, null);
});

test("applyLocalChatGPTHeaders injects Sites headers from the local cookie", () => {
  const cookie = `${LOCAL_USER_COOKIE}=${serializeLocalUser(LOCAL_PREVIEW_USER)}`;
  const decorated = applyLocalChatGPTHeaders(
    new Request("http://localhost:3001/en", { headers: { cookie, host: "localhost:3001" } }),
  );
  assert.equal(decorated.headers.get(USER_EMAIL_HEADER), LOCAL_PREVIEW_USER.email);
});

test("readLocalUserFromCookie accepts Next.js percent-encoded cookie values", () => {
  const encoded = encodeURIComponent(serializeLocalUser(LOCAL_PREVIEW_USER));
  assert.deepEqual(
    readLocalUserFromCookie(`${LOCAL_USER_COOKIE}=${encoded}`),
    LOCAL_PREVIEW_USER,
  );
});
