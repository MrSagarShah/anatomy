import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  CALLBACK_PATH,
  isAppOwnedAuthHost,
  PERCENT_ENCODED_UTF8,
  readLocalUserFromCookie,
  safeRelativeReturnPath,
  SIGN_IN_PATH,
  SIGN_OUT_PATH,
  USER_EMAIL_HEADER,
  USER_FULL_NAME_ENCODING_HEADER,
  USER_FULL_NAME_HEADER,
} from "./lib/local-chatgpt-auth";

export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (email) {
    const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
    const fullName =
      encodedFullName &&
      requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
        ? safeDecodeURIComponent(encodedFullName)
        : null;

    return {
      displayName: fullName ?? email,
      email,
      fullName,
    };
  }

  // vinext local has no Dispatch. A loopback-only cookie is the stand-in so
  // Progress / API routes can resolve a learner without shipping app routes
  // that would steal Sites auth paths.
  const host = requestHeaders.get("host");
  if (!isAppOwnedAuthHost(host)) return null;
  const local = readLocalUserFromCookie(requestHeaders.get("cookie"));
  if (!local) return null;
  return {
    displayName: local.fullName,
    email: local.email,
    fullName: local.fullName,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export { CALLBACK_PATH, SIGN_IN_PATH, SIGN_OUT_PATH, safeRelativeReturnPath };

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
