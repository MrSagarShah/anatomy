import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  continuePath,
  isAppOwnedAuthHost,
  safeRelativeReturnPath,
} from "../../../lib/local-chatgpt-auth";
import {
  buildGoogleAuthorizeUrl,
  encodeOAuthState,
  GOOGLE_OAUTH_STATE_COOKIE,
  googleRedirectUri,
  isGoogleOAuthConfigured,
  oauthStateCookieOptions,
  randomOAuthNonce,
  readEnv,
} from "../../../lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const host = request.headers.get("host");
  if (!isAppOwnedAuthHost(host)) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const returnTo = safeRelativeReturnPath(url.searchParams.get("return_to"));
  const clientId = readEnv("GOOGLE_CLIENT_ID");
  if (!isGoogleOAuthConfigured() || !clientId) {
    redirect(continuePath(returnTo));
  }

  const nonce = randomOAuthNonce();
  const state = encodeOAuthState(nonce, returnTo);
  const jar = await cookies();
  jar.set(GOOGLE_OAUTH_STATE_COOKIE, nonce, oauthStateCookieOptions(host));

  redirect(
    buildGoogleAuthorizeUrl({
      clientId,
      redirectUri: googleRedirectUri(url.origin),
      state,
    }),
  );
}
