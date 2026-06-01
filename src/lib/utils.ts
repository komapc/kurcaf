// Shared helpers used across exercise modes.

/** Return a new array in random order (non-mutating). */
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

/** Build a multiple-choice option list: the correct item plus N shuffled distractors. */
export function buildOptions<T extends { id: string }>(correct: T, pool: T[], count = 3): T[] {
  const distractors = shuffle(pool.filter(item => item.id !== correct.id)).slice(0, count)
  return shuffle([correct, ...distractors])
}

/** Split text into word tokens, dropping fully-parenthesised tokens like "(divdesmit)". */
export function tokenize(text: string): string[] {
  return (text.match(/[^\s]+/g) ?? []).filter(t => !/^\(.*\)$/.test(t))
}

/** Strip trailing punctuation. */
export function stripPunct(s: string): string {
  return s.replace(/[.,!?;:…]+$/, '')
}

/** Lowercase + strip trailing punctuation, for lenient comparison. */
export function normalize(s: string): string {
  return stripPunct(s).toLowerCase()
}

/** Lowercase, trim, and fold Latvian diacritics to ASCII for "almost correct" matching. */
export function stripDiacritics(s: string): string {
  return s.trim().toLowerCase()
    .replace(/ā/g, 'a').replace(/ē/g, 'e').replace(/ī/g, 'i').replace(/ū/g, 'u')
    .replace(/ņ/g, 'n').replace(/ļ/g, 'l').replace(/ķ/g, 'k').replace(/ģ/g, 'g')
    .replace(/š/g, 's').replace(/ž/g, 'z').replace(/č/g, 'c')
}
