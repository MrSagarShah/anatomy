/**
 * Google sign-in for app-owned hosts (local + Vercel). ChatGPT Sites still
 * uses Dispatch — these helpers must not run on those hostnames.
 */
import {
  continuePath,
  isLoopbackHost,
  safeRelativeReturnPath,
  type LocalChatGPTUser,
} from "./local-chatgpt-auth";

export const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
export const GOOGLE_OAUTH_STATE_COOKIE = "anatomy_google_oauth";
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";
export const GOOGLE_START_PATH = "/api/auth/google";
/** Production web host. ChatGPT Sites is a different origin. */
export const PRODUCTION_APP_ORIGIN = "https://anatomy-omega-three.vercel.app";

const STATE_MAX_AGE = 60 * 10;

export function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(readEnv("GOOGLE_CLIENT_ID") && readEnv("GOOGLE_CLIENT_SECRET"));
}

export function googleRedirectUri(origin: string): string {
  return new URL(GOOGLE_CALLBACK_PATH, origin).toString();
}

export function randomOAuthNonce(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function encodeOAuthState(nonce: string, returnTo: string): string {
  return `${nonce}.${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function decodeOAuthState(state: string | null | undefined, nonce: string | null | undefined): string | null {
  if (!state || !nonce) return null;
  const separator = state.indexOf(".");
  if (separator < 1) return null;
  if (state.slice(0, separator) !== nonce) return null;
  try {
    return safeRelativeReturnPath(decodeURIComponent(state.slice(separator + 1)));
  } catch {
    return null;
  }
}

export function oauthStateCookieOptions(host: string | null | undefined, secureOverride?: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: STATE_MAX_AGE,
    secure: secureOverride ?? !isLoopbackHost(host),
  };
}

export function buildGoogleAuthorizeUrl(args: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.searchParams.set("client_id", args.clientId);
  url.searchParams.set("redirect_uri", args.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", args.state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export function googleContinueErrorPath(returnTo: string, error: "google" | "1"): string {
  const path = continuePath(returnTo);
  const url = new URL(path, "https://app.local");
  url.searchParams.set("error", error);
  return `${url.pathname}${url.search}`;
}

export function parseGoogleProfile(input: unknown): LocalChatGPTUser | null {
  if (!input || typeof input !== "object") return null;
  const profile = input as {
    email?: unknown;
    verified_email?: unknown;
    name?: unknown;
    given_name?: unknown;
  };
  if (profile.verified_email !== true) return null;
  const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
  if (!email.includes("@") || email.includes(" ")) return null;
  const fullName =
    (typeof profile.name === "string" && profile.name.trim()) ||
    (typeof profile.given_name === "string" && profile.given_name.trim()) ||
    email.split("@")[0];
  if (!fullName) return null;
  return { email, fullName };
}

export async function exchangeGoogleCode(args: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<LocalChatGPTUser | null> {
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: args.code,
      client_id: args.clientId,
      client_secret: args.clientSecret,
      redirect_uri: args.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return null;
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return null;

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  if (!profileRes.ok) return null;
  return parseGoogleProfile(await profileRes.json());
}
