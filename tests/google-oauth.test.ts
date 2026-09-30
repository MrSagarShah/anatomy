import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGoogleAuthorizeUrl,
  decodeOAuthState,
  encodeOAuthState,
  googleContinueErrorPath,
  googleRedirectUri,
  parseGoogleProfile,
} from "../app/lib/google-oauth";

test("encodeOAuthState round-trips a safe return path", () => {
  const state = encodeOAuthState("abc123", "/en?lesson=1");
  assert.equal(decodeOAuthState(state, "abc123"), "/en?lesson=1");
});

test("decodeOAuthState rejects a mismatched nonce or reserved path", () => {
  assert.equal(decodeOAuthState(encodeOAuthState("abc123", "/en"), "nope"), null);
  assert.equal(decodeOAuthState("noperiod", "noperiod"), null);
  assert.equal(
    decodeOAuthState(encodeOAuthState("abc123", "/signin-with-chatgpt"), "abc123"),
    "/",
  );
});

test("parseGoogleProfile requires a verified email", () => {
  assert.equal(parseGoogleProfile({ email: "ada@gmail.com", name: "Ada" }), null);
  assert.equal(
    parseGoogleProfile({ email: "ada@gmail.com", verified_email: false, name: "Ada" }),
    null,
  );
  assert.deepEqual(
    parseGoogleProfile({ email: "Ada@Gmail.com", verified_email: true, name: "Ada Lovelace" }),
    { email: "ada@gmail.com", fullName: "Ada Lovelace" },
  );
  assert.deepEqual(
    parseGoogleProfile({ email: "ada@gmail.com", verified_email: true, given_name: "Ada" }),
    { email: "ada@gmail.com", fullName: "Ada" },
  );
});

test("buildGoogleAuthorizeUrl asks Google for email and account picker", () => {
  const url = new URL(
    buildGoogleAuthorizeUrl({
      clientId: "client.apps.googleusercontent.com",
      redirectUri: "https://anatomy-omega-three.vercel.app/api/auth/google/callback",
      state: "nonce.%2Fen",
    }),
  );
  assert.equal(url.origin + url.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
  assert.equal(url.searchParams.get("client_id"), "client.apps.googleusercontent.com");
  assert.equal(url.searchParams.get("scope"), "openid email profile");
  assert.equal(url.searchParams.get("prompt"), "select_account");
  assert.equal(url.searchParams.get("response_type"), "code");
});

test("googleRedirectUri and continue error stay on-app", () => {
  assert.equal(
    googleRedirectUri("https://anatomy-omega-three.vercel.app"),
    "https://anatomy-omega-three.vercel.app/api/auth/google/callback",
  );
  assert.equal(
    googleContinueErrorPath("/en", "google"),
    "/en/auth/signup?return_to=%2Fen&error=google",
  );
});
