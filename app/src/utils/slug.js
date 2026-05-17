export function toSlug(id, title) {
  const eng = (title || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return eng ? `${id}-${eng}` : String(id);
}

export function idFromSlug(slug) {
  return parseInt((slug || '').split('-')[0], 10);
}
