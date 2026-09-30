import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import {
  applyLocalChatGPTHeaders,
  handleLocalChatGPTAuth,
} from "../app/lib/local-chatgpt-auth";

/**
 * Vite-dev intercept for ChatGPT Sites auth paths. vinext does not run
 * Next middleware, and Dispatch is not in front of `npm run dev`.
 */
export function localChatGPTAuth(): Plugin {
  return {
    name: "local-chatgpt-auth",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const request = nodeToFetchRequest(req);
        if (!request) {
          next();
          return;
        }

        const auth = handleLocalChatGPTAuth(request);
        if (auth) {
          writeFetchResponse(res, auth).catch(next);
          return;
        }

        const decorated = applyLocalChatGPTHeaders(request);
        if (decorated !== request) {
          decorated.headers.forEach((value, key) => {
            req.headers[key.toLowerCase()] = value;
          });
        }
        next();
      });
    },
  };
}

function nodeToFetchRequest(req: IncomingMessage): Request | null {
  const host = req.headers.host ?? "localhost";
  const path = req.url ?? "/";
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(", "));
    }
    return new Request(new URL(path, `http://${host}`).toString(), {
      method: req.method ?? "GET",
      headers,
    });
  } catch {
    return null;
  }
}

async function writeFetchResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}
