export function toSlug(id, title) {
  const slug = (title || '')
    .toLowerCase()
    .replace(/[().,!?:;'"<>{}[\]\\|^~`@#$%&*+=]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
  return slug ? `${id}-${slug}` : String(id);
}

export function idFromSlug(slug) {
  return parseInt((slug || '').split('-')[0], 10);
}

// Extract the numeric ID from a course object regardless of id field format
export function courseNumericId(c) {
  if (!c) return null;
  if (c.moocId != null) return c.moocId;
  if (typeof c.id === 'number') return c.id;
  // "mooc-285" → 285
  const strMatch = String(c.id || '').match(/(\d+)$/);
  if (strMatch) return parseInt(strMatch[1]);
  // fallback: extract from href ".../285"
  const hrefMatch = (c.href || '').match(/\/(\d+)\s*$/);
  if (hrefMatch) return parseInt(hrefMatch[1]);
  return null;
}
