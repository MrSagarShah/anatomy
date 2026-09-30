/** Fields a library search can match — name plus the prose a learner would type. */
export type SearchableOrgan = {
  name: string;
  system: string;
  scientificName: string;
  description: string;
  function: string;
  conditions: string[];
  hotspots: Array<{ label: string; detail: string }>;
};

export function organMatchesQuery(item: SearchableOrgan, query: string, locale: string): boolean {
  const needle = query.trim().toLocaleLowerCase(locale);
  if (!needle) return true;
  const haystack = [
    item.name,
    item.system,
    item.scientificName,
    item.description,
    item.function,
    ...item.conditions,
    ...item.hotspots.flatMap((hotspot) => [hotspot.label, hotspot.detail]),
  ]
    .join(" ")
    .toLocaleLowerCase(locale);
  return haystack.includes(needle);
}
