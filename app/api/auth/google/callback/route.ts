import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  isAppOwnedAuthHost,
  learnerSessionCookieOptions,
  LOCAL_USER_COOKIE,
  serializeLocalUser,
} from "../../../../lib/local-chatgpt-auth";
import {
  decodeOAuthState,
  exchangeGoogleCode,
  GOOGLE_OAUTH_STATE_COOKIE,
  googleContinueErrorPath,
  googleRedirectUri,
  readEnv,
} from "../../../../lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const host = request.headers.get("host");
  if (!isAppOwnedAuthHost(host)) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const jar = await cookies();
  const returnTo =
    decodeOAuthState(url.searchParams.get("state"), jar.get(GOOGLE_OAUTH_STATE_COOKIE)?.value) ??
    "/en";
  jar.delete(GOOGLE_OAUTH_STATE_COOKIE);

  const code = url.searchParams.get("code");
  const clientId = readEnv("GOOGLE_CLIENT_ID");
  const clientSecret = readEnv("GOOGLE_CLIENT_SECRET");
  if (!code || !clientId || !clientSecret) {
    redirect(googleContinueErrorPath(returnTo, "google"));
  }

  const user = await exchangeGoogleCode({
    code,
    redirectUri: googleRedirectUri(url.origin),
    clientId,
    clientSecret,
  }).catch(() => null);
  if (!user) {
    redirect(googleContinueErrorPath(returnTo, "google"));
  }

  jar.set(LOCAL_USER_COOKIE, serializeLocalUser(user), learnerSessionCookieOptions(host));
  redirect(returnTo);
}
