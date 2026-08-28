// Client-side Slug utility functions for SeshNx studio URLs

/**
 * Common dictionary for slug compaction.
 * Compacts long repeated words (e.g. 'recording' -> 'rec') to save character length
 * while preserving clear brand identity and readable URLs.
 */
export const SLUG_WORD_COMPACTIONS: Record<string, string> = {
  // Audio & Music terms
  recording: 'rec',
  recordings: 'recs',
  records: 'recs',
  record: 'rec',
  production: 'prod',
  productions: 'prods',
  producer: 'prod',
  producers: 'prods',
  mastering: 'mast',
  engineering: 'eng',
  engineer: 'eng',
  engineers: 'eng',
  entertainment: 'ent',
  management: 'mgmt',
  manager: 'mgr',
  acoustic: 'acoust',
  acoustics: 'acoust',
  creative: 'cr',
  collective: 'cltv',
  collaboration: 'collab',
  collaborations: 'collabs',
  music: 'mus',
  musical: 'mus',
  audio: 'aud',
  sound: 'snd',
  sounds: 'snds',
  session: 'sesh',
  sessions: 'seshs',
  digital: 'digi',
  media: 'med',
  international: 'intl',
  national: 'natl',
  broadcast: 'bcast',
  broadcasting: 'bcast',
  publishing: 'pub',
  publishers: 'pubs',
  publisher: 'pub',
  laboratory: 'lab',
  laboratories: 'labs',
  workshop: 'wrkshp',
  workshops: 'wrkshp',
  center: 'ctr',
  centre: 'ctr',
  house: 'hse',
  station: 'stn',
  street: 'st',
  boulevard: 'blvd',
  avenue: 'ave',
  apartment: 'apt',
  suite: 'ste',
  building: 'bldg',
  company: 'co',
  corporation: 'corp',
  incorporated: 'inc',
  limited: 'ltd',
  group: 'grp',
  association: 'assoc',
  department: 'dept',
  network: 'net',
  networks: 'nets',
};

/**
 * Compacts words within a slug string based on known dictionary abbreviations.
 */
export function compactSlugWords(raw: string): string {
  const tokens = raw
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(Boolean);

  const compactedTokens = tokens.map((token) => {
    const cleanWord = token.replace(/[^a-z0-9]/g, '');
    if (SLUG_WORD_COMPACTIONS[cleanWord]) {
      return SLUG_WORD_COMPACTIONS[cleanWord];
    }
    return cleanWord;
  }).filter(Boolean);

  return compactedTokens.join('-');
}

/**
 * Generates a compacted, URL-friendly slug from a studio or business name.
 * Example: "El Monte Recording Studio" -> "el-monte-rec-studio"
 */
export function generateSlug(name: string): string {
  if (!name) return 'studio-' + Math.random().toString(36).substring(2, 6);

  // Apply word compaction first
  let slug = compactSlugWords(name);

  // Replace any remaining non-alphanumeric characters with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Collapse consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Limit to 40 characters
  if (slug.length > 40) {
    slug = slug.substring(0, 40).replace(/-+$/, '');
  }

  // Ensure it starts and ends with alphanumeric
  slug = slug.replace(/^-/, '').replace(/-$/, '');

  // If the result is empty or too short, append random chars
  if (slug.length < 3) {
    slug = 'studio-' + Math.random().toString(36).substring(2, 6);
  }

  return slug;
}
