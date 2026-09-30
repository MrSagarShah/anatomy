import type { DrizzleD1Database } from "drizzle-orm/d1";
import { getHttpDb, isHttpDbConfigured } from "./http";
import type * as schema from "./schema";

export type AppDb = DrizzleD1Database<typeof schema>;

/**
 * Open the learner database. Vercel uses the D1 HTTP API (env credentials).
 * vinext / Sites use the `DB` Worker binding. Never import `cloudflare:workers`
 * from this file — Next's Vercel build would then fail at collect-time.
 */
export async function getDb(): Promise<AppDb> {
  if (isHttpDbConfigured()) return getHttpDb() as unknown as AppDb;
  if (process.env.VERCEL) {
    throw new Error("Cloudflare D1 HTTP credentials are not configured.");
  }
  const { getWorkersDb } = await import("./workers-binding");
  return getWorkersDb() as unknown as AppDb;
}
