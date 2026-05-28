import { describe, it, expect, beforeEach } from 'vitest'
import { getProgress, getItemProgress, recordResult, getWeak, getLessonProgress, resetProgress } from '../lib/progress'

beforeEach(() => {
  localStorage.clear()
})

describe('getProgress', () => {
  it('returns empty object when nothing stored', () => {
    expect(getProgress()).toEqual({})
  })

  it('returns stored progress', () => {
    localStorage.setItem('kurcaf_progress', JSON.stringify({ abc: { seen: 1, correct: 1, incorrect: 0 } }))
    expect(getProgress()).toEqual({ abc: { seen: 1, correct: 1, incorrect: 0 } })
  })

  it('returns empty object on invalid JSON', () => {
    localStorage.setItem('kurcaf_progress', 'not-json')
    expect(getProgress()).toEqual({})
  })
})

describe('getItemProgress', () => {
  it('returns zero counts for unknown id', () => {
    expect(getItemProgress('unknown')).toEqual({ seen: 0, correct: 0, incorrect: 0 })
  })

  it('returns stored counts for known id', () => {
    localStorage.setItem('kurcaf_progress', JSON.stringify({ x: { seen: 3, correct: 2, incorrect: 1 } }))
    expect(getItemProgress('x')).toEqual({ seen: 3, correct: 2, incorrect: 1 })
  })
})

describe('recordResult', () => {
  it('increments seen and correct on correct answer', () => {
    recordResult('a', true)
    expect(getItemProgress('a')).toEqual({ seen: 1, correct: 1, incorrect: 0 })
  })

  it('increments seen and incorrect on wrong answer', () => {
    recordResult('b', false)
    expect(getItemProgress('b')).toEqual({ seen: 1, correct: 0, incorrect: 1 })
  })

  it('accumulates across multiple calls', () => {
    recordResult('c', true)
    recordResult('c', true)
    recordResult('c', false)
    expect(getItemProgress('c')).toEqual({ seen: 3, correct: 2, incorrect: 1 })
  })

  it('handles multiple different ids independently', () => {
    recordResult('d1', true)
    recordResult('d2', false)
    expect(getItemProgress('d1')).toEqual({ seen: 1, correct: 1, incorrect: 0 })
    expect(getItemProgress('d2')).toEqual({ seen: 1, correct: 0, incorrect: 1 })
  })
})

describe('getWeak', () => {
  it('returns empty array when no progress', () => {
    expect(getWeak()).toEqual([])
  })

  it('excludes items below minAttempts', () => {
    recordResult('e', false)
    expect(getWeak(0.6, 2)).toEqual([])
  })

  it('returns item when accuracy below threshold after minAttempts', () => {
    recordResult('f', false)
    recordResult('f', false)
    expect(getWeak(0.6, 2)).toContain('f')
  })

  it('excludes item when accuracy meets threshold', () => {
    recordResult('g', true)
    recordResult('g', true)
    expect(getWeak(0.6, 2)).not.toContain('g')
  })

  it('respects custom threshold', () => {
    recordResult('h', true)
    recordResult('h', false)
    // accuracy = 0.5
    expect(getWeak(0.6, 2)).toContain('h')   // below 0.6 threshold
    expect(getWeak(0.4, 2)).not.toContain('h') // above 0.4 threshold
  })
})

describe('getLessonProgress', () => {
  it('returns 0 seen for empty store', () => {
    expect(getLessonProgress(['a', 'b', 'c'])).toEqual({ seen: 0, total: 3 })
  })

  it('counts ids that have been seen', () => {
    recordResult('a', true)
    recordResult('b', false)
    expect(getLessonProgress(['a', 'b', 'c'])).toEqual({ seen: 2, total: 3 })
  })

  it('returns total equal to ids length', () => {
    expect(getLessonProgress(['x', 'y'])).toEqual({ seen: 0, total: 2 })
  })
})

describe('resetProgress', () => {
  it('clears all progress', () => {
    recordResult('a', true)
    recordResult('b', false)
    resetProgress()
    expect(getProgress()).toEqual({})
  })
})
