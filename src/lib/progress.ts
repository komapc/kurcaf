import type { ItemProgress } from './types'

const STORAGE_KEY = 'kurcaf_progress'

type ProgressStore = Record<string, ItemProgress>

export function getProgress(): ProgressStore {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function getItemProgress(id: string): ItemProgress {
  return getProgress()[id] ?? { seen: 0, correct: 0, incorrect: 0 }
}

export function recordResult(id: string, correct: boolean): void {
  const store = getProgress()
  const prev = store[id] ?? { seen: 0, correct: 0, incorrect: 0 }
  store[id] = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    incorrect: prev.incorrect + (correct ? 0 : 1),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getWeak(threshold = 0.6, minAttempts = 2): string[] {
  const store = getProgress()
  return Object.entries(store)
    .filter(([, p]) => {
      const total = p.correct + p.incorrect
      return total >= minAttempts && p.correct / total < threshold
    })
    .map(([id]) => id)
}

export function getLessonProgress(ids: string[]): { seen: number; total: number } {
  const store = getProgress()
  const seen = ids.filter(id => (store[id]?.seen ?? 0) > 0).length
  return { seen, total: ids.length }
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}
