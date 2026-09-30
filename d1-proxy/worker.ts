type Env = {
  DB: D1Database;
  PROXY_SECRET: string;
};

type QueryBody = {
  sql?: unknown;
  params?: unknown;
};

function bindValue(value: unknown): string | number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  return String(value);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({ success: false, errors: [{ message: "Method not allowed" }] }, { status: 405 });
    }
    const expected = env.PROXY_SECRET;
    const got = request.headers.get("authorization");
    if (!expected || got !== `Bearer ${expected}`) {
      return Response.json({ success: false, errors: [{ message: "Authentication error" }] }, { status: 401 });
    }

    let body: QueryBody;
    try {
      body = (await request.json()) as QueryBody;
    } catch {
      return Response.json({ success: false, errors: [{ message: "Invalid JSON" }] }, { status: 400 });
    }
    if (typeof body.sql !== "string" || !body.sql.trim()) {
      return Response.json({ success: false, errors: [{ message: "Missing sql" }] }, { status: 400 });
    }
    const params = Array.isArray(body.params) ? body.params.map(bindValue) : [];

    try {
      const statement = params.length ? env.DB.prepare(body.sql).bind(...params) : env.DB.prepare(body.sql);
      const result = await statement.all();
      return Response.json({
        success: true,
        result: [{ results: result.results ?? [], success: true }],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({
        success: true,
        result: [{ results: [], success: false, error: message }],
      });
    }
  },
};
