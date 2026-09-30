import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  isAppOwnedAuthHost,
  learnerSessionCookieOptions,
  LOCAL_PREVIEW_USER,
  LOCAL_USER_COOKIE,
  parseLocalUser,
  safeRelativeReturnPath,
  serializeLocalUser,
} from "../../../lib/local-chatgpt-auth";

export const dynamic = "force-dynamic";

function readUser(form: FormData) {
  if (form.get("demo") === "1") return LOCAL_PREVIEW_USER;
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const fullName = String(form.get("fullName") ?? "").trim();
  return parseLocalUser(`${encodeURIComponent(email)}|${encodeURIComponent(fullName)}`);
}

export async function POST(request: Request) {
  const host = request.headers.get("host");
  if (!isAppOwnedAuthHost(host)) {
    return new Response("Not found", { status: 404 });
  }

  const form = await request.formData();
  const user = readUser(form);
  const returnTo = safeRelativeReturnPath(String(form.get("returnTo") ?? "/en"));
  if (!user) {
    redirect(`/en/auth/continue?return_to=${encodeURIComponent(returnTo)}&error=1`);
  }

  const jar = await cookies();
  jar.set(LOCAL_USER_COOKIE, serializeLocalUser(user), learnerSessionCookieOptions(host));
  redirect(returnTo);
}
