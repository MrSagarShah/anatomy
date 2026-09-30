/**
 * Stand-in for ChatGPT Sites Dispatch auth when Dispatch is not in front
 * (vinext `npm run dev` and Vercel). Dispatch owns `/signin-with-chatgpt`,
 * `/signout-with-chatgpt`, and `/callback` on Sites — this must never run
 * on `*.openai.site` / `*.chatgpt.site`.
 */

export const LOCAL_USER_COOKIE = "anatomy_local_chatgpt";
export const SIGN_IN_PATH = "/signin-with-chatgpt";
export const SIGN_OUT_PATH = "/signout-with-chatgpt";
export const CALLBACK_PATH = "/callback";

export const USER_EMAIL_HEADER = "oai-authenticated-user-email";
export const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
export const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
export const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";

export const LOCAL_PREVIEW_USER = {
  email: "local@anatomy.test",
  fullName: "Local Learner",
} as const;

export type LocalChatGPTUser = {
  email: string;
  fullName: string;
};

export const LEARNER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const COOKIE_MAX_AGE = LEARNER_SESSION_MAX_AGE;

export function learnerSessionCookieOptions(host: string | null | undefined) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: LEARNER_SESSION_MAX_AGE,
    secure: !isLoopbackHost(host),
  };
}

export function isLoopbackHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const hostname = hostnameOf(host);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".localhost")
  );
}

/** Loopback or Vercel preview/prod. Never ChatGPT Sites hostnames. */
export function isAppOwnedAuthHost(host: string | null | undefined): boolean {
  if (!host) return false;
  if (isLoopbackHost(host)) return true;
  const hostname = hostnameOf(host);
  if (
    hostname.endsWith(".openai.site") ||
    hostname.endsWith(".chatgpt.site") ||
    hostname === "chatgpt.com"
  ) {
    return false;
  }
  return hostname.endsWith(".vercel.app");
}

function hostnameOf(host: string): string {
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return (end > 0 ? host.slice(1, end) : host).toLowerCase();
  }
  const first = host.indexOf(":");
  const last = host.lastIndexOf(":");
  if (first > -1 && first === last) return host.slice(0, first).toLowerCase();
  return host.toLowerCase();
}

export function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

export function safeRelativeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

export function serializeLocalUser(user: LocalChatGPTUser): string {
  return `${encodeURIComponent(user.email)}|${encodeURIComponent(user.fullName)}`;
}

export function parseLocalUser(value: string | null | undefined): LocalChatGPTUser | null {
  if (!value) return null;
  const separator = value.indexOf("|");
  if (separator < 1) return null;
  let email: string;
  let fullName: string;
  try {
    email = decodeURIComponent(value.slice(0, separator)).trim().toLowerCase();
    fullName = decodeURIComponent(value.slice(separator + 1)).trim();
  } catch {
    return null;
  }
  if (!email.includes("@") || email.includes(" ") || !fullName) return null;
  return { email, fullName };
}

export function readCookie(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return null;
}

export function readLocalUserFromCookie(cookieHeader: string | null | undefined): LocalChatGPTUser | null {
  const raw = readCookie(cookieHeader, LOCAL_USER_COOKIE);
  if (!raw) return null;
  // Next.js cookies().set percent-encodes the value; the Cookie header then
  // needs one extra decode before email|name parsing.
  return parseLocalUser(raw) ?? parseLocalUser(safeDecodeURIComponent(raw));
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function cookieAttributes(maxAge: number, secure: boolean): string {
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly${secure ? "; Secure" : ""}`;
}

export function localUserSetCookie(
  user: LocalChatGPTUser = LOCAL_PREVIEW_USER,
  secure = false,
): string {
  return `${LOCAL_USER_COOKIE}=${serializeLocalUser(user)}; ${cookieAttributes(COOKIE_MAX_AGE, secure)}`;
}

export function localUserClearCookie(secure = false): string {
  return `${LOCAL_USER_COOKIE}=; ${cookieAttributes(0, secure)}`;
}

export function applyLocalChatGPTHeaders(request: Request): Request {
  const host = request.headers.get("host") ?? new URL(request.url).hostname;
  if (!isAppOwnedAuthHost(host)) return request;
  if (request.headers.get(USER_EMAIL_HEADER)) return request;

  const user = readLocalUserFromCookie(request.headers.get("cookie"));
  if (!user) return request;

  const headers = new Headers(request.headers);
  headers.set(USER_EMAIL_HEADER, user.email);
  headers.set(USER_FULL_NAME_HEADER, encodeURIComponent(user.fullName));
  headers.set(USER_FULL_NAME_ENCODING_HEADER, PERCENT_ENCODED_UTF8);
  return new Request(request, { headers });
}

export function continuePath(returnTo: string): string {
  const locale = returnTo.split("/").filter(Boolean)[0];
  const code = locale && /^[a-z]{2}$/.test(locale) ? locale : "en";
  return `/${code}/auth/continue?return_to=${encodeURIComponent(returnTo)}`;
}

/** Handle Dispatch-owned auth paths on app-owned hosts only. Returns null elsewhere. */
export function handleLocalChatGPTAuth(request: Request): Response | null {
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.hostname;
  if (!isAppOwnedAuthHost(host) || !isReservedAuthPath(url.pathname)) return null;

  const secure = !isLoopbackHost(host);
  const returnTo = safeRelativeReturnPath(url.searchParams.get("return_to"));
  if (url.pathname === SIGN_OUT_PATH) {
    // Back to the login page — guests must not land on Progress or the studio.
    return redirectWithCookie(url, continuePath(returnTo), localUserClearCookie(secure));
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(continuePath(returnTo), url.origin).toString(),
      "Cache-Control": "no-store",
    },
  });
}

function redirectWithCookie(url: URL, returnTo: string, cookie: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(returnTo, url.origin).toString(),
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
    },
  });
}
