import { getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";
import { learners, lessonProgress, organMastery, progressEvents } from "./schema";

type D1QueryResponse = {
  success: boolean;
  errors?: { message: string }[];
  result?: {
    results?: Record<string, unknown>[] | unknown[][];
    success?: boolean;
    error?: string;
  }[];
};

const TABLE_COLUMN_ORDERS = [
  learners,
  progressEvents,
  organMastery,
  lessonProgress,
].map((table) => Object.values(getTableColumns(table)).map((column) => column.name));

function readEnv(name: string): string | undefined {
  // Dynamic key so Next cannot replace these with empty strings at build
  // time (Vercel Secrets are runtime-only).
  const value = process.env[name];
  if (!value || value === "[SENSITIVE]") return undefined;
  return value;
}

function httpConfig(): { accountId: string; databaseId: string; token: string } | null {
  const accountId = readEnv("CLOUDFLARE_ACCOUNT_ID");
  const databaseId = readEnv("CLOUDFLARE_D1_DATABASE_ID");
  const token = readEnv("CLOUDFLARE_API_TOKEN");
  if (!accountId || !databaseId || !token) return null;
  return { accountId, databaseId, token };
}

export function isHttpDbConfigured(): boolean {
  return httpConfig() !== null;
}

async function queryD1(
  sql: string,
  params: unknown[],
): Promise<Array<Record<string, unknown> | unknown[]>> {
  const config = httpConfig();
  if (!config) {
    throw new Error("Cloudflare D1 HTTP credentials are not configured.");
  }
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );
  const payload = (await response.json()) as D1QueryResponse;
  const first = payload.result?.[0];
  if (!response.ok || !payload.success || first?.success === false) {
    const detail =
      first?.error ||
      payload.errors?.map((error) => error.message).join("; ") ||
      response.statusText;
    throw new Error(`D1 query failed: ${detail}`);
  }
  return first?.results ?? [];
}

function asValueRows(rows: Array<Record<string, unknown> | unknown[]>): unknown[][] {
  return rows.map((row) => {
    if (Array.isArray(row)) return row;
    const names = TABLE_COLUMN_ORDERS.find((columns) =>
      columns.every((name) => Object.prototype.hasOwnProperty.call(row, name)),
    );
    return names ? names.map((name) => row[name]) : Object.values(row);
  });
}

export function getHttpDb() {
  return drizzle(
    async (sql, params, method) => {
      const rows = await queryD1(sql, params);
      if (method === "get") return { rows: asValueRows(rows)[0] ?? [] };
      return { rows: asValueRows(rows) };
    },
    { schema },
  );
}
