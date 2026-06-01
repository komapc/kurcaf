import { describe, it, expect } from 'vitest'
import { shuffle, buildOptions, tokenize, stripPunct, normalize, stripDiacritics } from '../lib/utils'

describe('shuffle', () => {
  it('keeps the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    expect(shuffle(input).sort((a, b) => a - b)).toEqual(input)
  })
  it('does not mutate the input', () => {
    const input = [1, 2, 3]
    shuffle(input)
    expect(input).toEqual([1, 2, 3])
  })
})

describe('buildOptions', () => {
  const items = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }))
  it('always includes the correct item', () => {
    const opts = buildOptions(items[0], items)
    expect(opts.map(o => o.id)).toContain('0')
  })
  it('returns correct + up to N distractors', () => {
    expect(buildOptions(items[0], items, 3)).toHaveLength(4)
  })
  it('never repeats the correct item as a distractor', () => {
    const ids = buildOptions(items[0], items).map(o => o.id)
    expect(ids.filter(id => id === '0')).toHaveLength(1)
  })
  it('handles a pool smaller than the requested count', () => {
    const small = [{ id: 'a' }, { id: 'b' }]
    expect(buildOptions(small[0], small, 3)).toHaveLength(2)
  })
})

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('Viņš ir mājās')).toEqual(['Viņš', 'ir', 'mājās'])
  })
  it('drops fully-parenthesised tokens', () => {
    expect(tokenize('Viņš ir 20 (divdesmit) gadus vecs'))
      .toEqual(['Viņš', 'ir', '20', 'gadus', 'vecs'])
  })
})

describe('stripPunct', () => {
  it('removes trailing punctuation', () => {
    expect(stripPunct('Sveiki!')).toBe('Sveiki')
    expect(stripPunct('Kā iet?')).toBe('Kā iet')
  })
})

describe('normalize', () => {
  it('lowercases and strips trailing punctuation', () => {
    expect(normalize('Sieviete.')).toBe('sieviete')
  })
})

describe('stripDiacritics', () => {
  it('folds Latvian diacritics to ASCII', () => {
    expect(stripDiacritics('vīrietis')).toBe('virietis')
    expect(stripDiacritics('Kaķis')).toBe('kakis')
    expect(stripDiacritics('žēl')).toBe('zel')
  })
  it('trims and lowercases', () => {
    expect(stripDiacritics('  ŠODIEN  ')).toBe('sodien')
  })
})
