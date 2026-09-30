import type { OrganId } from "../anatomy-data";
import type { LibraryInput } from "./types";

const ORGAN_IDS = new Set<string>([
  "heart",
  "brain",
  "lungs",
  "liver",
  "kidneys",
  "eyeball",
  "intestine",
  "pancreas",
  "skin",
] satisfies OrganId[]);

export function parseSavedOrgans(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && ORGAN_IDS.has(id)).slice(0, 24);
  } catch {
    return [];
  }
}

export function parseNotes(raw: string | null | undefined): Record<string, string> {
  try {
    const parsed = JSON.parse(raw ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!ORGAN_IDS.has(key) || typeof value !== "string") continue;
      const trimmed = value.slice(0, 4000);
      if (trimmed.trim()) out[key] = trimmed;
    }
    return out;
  } catch {
    return {};
  }
}

export function sanitizeLibrary(body: unknown): LibraryInput {
  const input = (body ?? {}) as Record<string, unknown>;
  const savedOrgans = Array.isArray(input.savedOrgans)
    ? input.savedOrgans.filter((id): id is string => typeof id === "string" && ORGAN_IDS.has(id)).slice(0, 24)
    : undefined;
  const notes =
    input.notes && typeof input.notes === "object" && !Array.isArray(input.notes)
      ? parseNotes(JSON.stringify(input.notes))
      : undefined;
  return { savedOrgans, notes };
}

/**
 * Signed-in snapshot wins once the server has anything. An empty server row
 * plus local guest data means this is the first sign-in on this browser —
 * keep local and tell the caller to upload it.
 */
export function hydrateLibrary(
  server: { savedOrgans: string[]; notes: Record<string, string> },
  local: { savedOrgans: string[]; notes: Record<string, string> },
): { savedOrgans: string[]; notes: Record<string, string>; uploadLocal: boolean } {
  const serverEmpty = server.savedOrgans.length === 0 && Object.keys(server.notes).length === 0;
  const localHas = local.savedOrgans.length > 0 || Object.keys(local.notes).length > 0;
  if (serverEmpty && localHas) {
    return { savedOrgans: local.savedOrgans, notes: local.notes, uploadLocal: true };
  }
  return { savedOrgans: server.savedOrgans, notes: server.notes, uploadLocal: false };
}
