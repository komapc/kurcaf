import { describe, it, expect, beforeEach } from 'vitest'
import { initFromRaw, isInitialized, resetData, allUnits, wordMap, sentenceMap, dialogueMap, getLesson, getUnit, getUnitWords } from '../lib/data'

const sampleRaw = {
  mergedTarget: {
    words: {
      '1,1': {
        allIds: ['a0101000', 'a0101001'],
        byId: {
          'a0101000': { id: 'a0101000', translation: 'woman', original: 'sieviete', soundFile: 'a0101000.mp3', imageSource: 'a0101000.png', unit: 1, lesson: 1, order: 0, transcript: null },
          'a0101001': { id: 'a0101001', translation: 'man', original: 'vīrietis', soundFile: 'a0101001.mp3', imageSource: 'a0101001.png', unit: 1, lesson: 1, order: 1, transcript: null },
        },
      },
      '2,1': {
        allIds: ['a0201000'],
        byId: {
          'a0201000': { id: 'a0201000', translation: 'cat', original: 'kaķis', soundFile: 'a0201000.mp3', imageSource: 'a0201000.png', unit: 2, lesson: 1, order: 0, transcript: null },
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
      '2,1': { allIds: [], byId: {} },
    },
    dialogues: {
      '1,1': {
        allIds: ['a0101200', 'a0101201'],
        byId: {
          'a0101200': { id: 'a0101200', translation: 'Hello.', original: 'Sveiki.', soundFile: 'a0101200.mp3', imageSource: 'a0101200.png', unit: 1, lesson: 1, order: 0, transcript: null, speaker: 0 },
          'a0101201': { id: 'a0101201', translation: 'Hi.', original: 'Čau.', soundFile: 'a0101201.mp3', imageSource: 'a0101201.png', unit: 1, lesson: 1, order: 1, transcript: null, speaker: 1 },
        },
      },
      '2,1': { allIds: [], byId: {} },
    },
    characters: [],
    grammar: [],
    features: { hasSpeaking: true, hasTranscript: false, isSpacedLang: true, hasGrammar: false, hasWriting: false },
    targetVersions: 1,
    nativeVersions: 1,
    writtenNumbers: { allIds: ['1'], byId: { '1': 'viens' } },
    nativewrittenNumbers: { allIds: ['1'], byId: { '1': 'one' } },
    storeLinks: { iosLink: '', googleLink: '' },
  },
}

beforeEach(() => {
  initFromRaw(sampleRaw)
})

describe('resetData', () => {
  it('clears all maps, allUnits and the initialized flag', () => {
    resetData()
    expect(isInitialized()).toBe(false)
    expect(wordMap.size).toBe(0)
    expect(sentenceMap.size).toBe(0)
    expect(dialogueMap.size).toBe(0)
    expect(allUnits).toEqual([])
    expect(getLesson(1, 1)).toBeNull()
  })
})

describe('initFromRaw', () => {
  it('sets initialized flag', () => {
    expect(isInitialized()).toBe(true)
  })

  it('populates allUnits', () => {
    expect(allUnits).toEqual([1, 2])
  })

  it('populates wordMap', () => {
    expect(wordMap.size).toBe(3)
    expect(wordMap.get('a0101000')?.original).toBe('sieviete')
    expect(wordMap.get('a0101001')?.original).toBe('vīrietis')
  })

  it('populates sentenceMap', () => {
    expect(sentenceMap.size).toBe(1)
    expect(sentenceMap.get('a0101100')?.translation).toBe('A woman.')
  })

  it('populates dialogueMap', () => {
    expect(dialogueMap.size).toBe(2)
    expect(dialogueMap.get('a0101200')?.speaker).toBe(0)
    expect(dialogueMap.get('a0101201')?.speaker).toBe(1)
  })

  it('re-initialising clears previous state', () => {
    const other = { mergedTarget: { ...sampleRaw.mergedTarget, words: { '5,1': { allIds: ['z'], byId: { z: { id: 'z', translation: 't', original: 'o', soundFile: 'z.mp3', imageSource: 'z.png', unit: 5, lesson: 1, order: 0, transcript: null } } } }, sentences: { '5,1': { allIds: [], byId: {} } }, dialogues: { '5,1': { allIds: [], byId: {} } } } }
    initFromRaw(other)
    expect(allUnits).toEqual([5])
    expect(wordMap.has('a0101000')).toBe(false)
    expect(wordMap.get('z')?.translation).toBe('t')
  })
})

describe('getLesson', () => {
  it('returns lesson bundle for valid unit/lesson', () => {
    const bundle = getLesson(1, 1)
    expect(bundle).not.toBeNull()
    expect(bundle?.unit).toBe(1)
    expect(bundle?.lesson).toBe(1)
  })

  it('returns null for unknown unit', () => {
    expect(getLesson(99, 1)).toBeNull()
  })

  it('returns null for unknown lesson', () => {
    expect(getLesson(1, 99)).toBeNull()
  })

  it('words are sorted by order', () => {
    const bundle = getLesson(1, 1)!
    expect(bundle.words[0].id).toBe('a0101000')
    expect(bundle.words[1].id).toBe('a0101001')
  })

  it('sentences reference correct word ids', () => {
    const bundle = getLesson(1, 1)!
    expect(bundle.sentences[0].word).toBe('a0101000')
  })

  it('dialogues have speaker field', () => {
    const bundle = getLesson(1, 1)!
    expect(bundle.dialogues[0].speaker).toBe(0)
    expect(bundle.dialogues[1].speaker).toBe(1)
  })
})

describe('getUnit', () => {
  it('returns lessons sorted by lesson number', () => {
    const lessons = getUnit(1)
    expect(lessons.length).toBe(1)
    expect(lessons[0].lesson).toBe(1)
  })

  it('returns empty array for unknown unit', () => {
    expect(getUnit(99)).toEqual([])
  })
})

describe('getUnitWords', () => {
  it('returns all words across all lessons of a unit', () => {
    const words = getUnitWords(1)
    expect(words.length).toBe(2)
    expect(words.map(w => w.id)).toContain('a0101000')
    expect(words.map(w => w.id)).toContain('a0101001')
  })

  it('returns empty for unknown unit', () => {
    expect(getUnitWords(99)).toEqual([])
  })
})
