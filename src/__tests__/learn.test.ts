import { describe, it, expect, beforeEach } from 'vitest'
import { initFromRaw, getLesson } from '../lib/data'
import { tokenMatchesWord } from '../app/lesson/[unit]/[lesson]/learn/Client'

const sampleRaw = {
  mergedTarget: {
    words: {
      '1,1': {
        allIds: ['a0101000'],
        byId: {
          'a0101000': { id: 'a0101000', translation: 'woman', original: 'sieviete', soundFile: 'a0101000.mp3', imageSource: 'a0101000.png', unit: 1, lesson: 1, order: 0, transcript: null },
        },
      },
    },
    sentences: {
      '1,1': {
        allIds: ['a0101100'],
        byId: {
          'a0101100': { id: 'a0101100', translation: 'A woman.', original: 'Sieviete.', soundFile: 'a0101100.mp3', imageSource: 'a0101100.png', unit: 1, lesson: 1, order: 0, transcript: null, word: 'a0101000' },
        },
      },
    },
    dialogues: { '1,1': { allIds: [], byId: {} } },
  },
}

beforeEach(() => initFromRaw(sampleRaw))

describe('Learn word→sentence pairing', () => {
  it('finds the example sentence for a word via Sentence.word', () => {
    const bundle = getLesson(1, 1)!
    const word = bundle.words[0]
    const example = bundle.sentences.find(s => s.word === word.id)
    expect(example?.id).toBe('a0101100')
    expect(example?.original).toBe('Sieviete.')
  })
})

describe('tokenMatchesWord', () => {
  it('matches case- and diacritic-insensitively', () => {
    expect(tokenMatchesWord('Sieviete.', 'sieviete')).toBe(true)
    expect(tokenMatchesWord('vīrietis', 'virietis')).toBe(true)
  })
  it('matches longer inflected forms by prefix', () => {
    expect(tokenMatchesWord('sievietei', 'sieviete')).toBe(true)
  })
  it('does not over-highlight short words', () => {
    expect(tokenMatchesWord('irbe', 'ir')).toBe(false)
    expect(tokenMatchesWord('ira', 'ir')).toBe(false)
  })
  it('still matches short words exactly', () => {
    expect(tokenMatchesWord('ir', 'ir')).toBe(true)
  })
})
