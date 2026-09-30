import { NextResponse, type NextRequest } from "next/server";
import { handleLocalChatGPTAuth } from "./app/lib/local-chatgpt-auth";

/** Vercel runs this; vinext / ChatGPT Sites do not. Sites Dispatch still owns
 *  these paths on `*.openai.site` — `handleLocalChatGPTAuth` no-ops there. */
export function middleware(request: NextRequest) {
  return handleLocalChatGPTAuth(request) ?? NextResponse.next();
}

export const config = {
  matcher: ["/signin-with-chatgpt", "/signout-with-chatgpt", "/callback"],
};
