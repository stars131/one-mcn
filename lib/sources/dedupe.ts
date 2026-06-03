import { NormalizedHotTopic } from "./types";

function fingerprint(item: NormalizedHotTopic) {
  return (item.url || item.title).trim().toLowerCase().replace(/\s+/g, " ");
}

export function dedupeHotTopics(items: NormalizedHotTopic[], existingKeys: string[] = []) {
  const seen = new Set(existingKeys.map((key) => key.trim().toLowerCase()));
  return items.filter((item) => {
    const key = fingerprint(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
