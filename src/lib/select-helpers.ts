export function buildItems<T extends { id: string; name: string }>(
  items: T[]
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items) map[item.id] = item.name;
  return map;
}

export function buildOptionItems(
  options: { value: string; label: string }[]
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const opt of options) map[opt.value] = opt.label;
  return map;
}
