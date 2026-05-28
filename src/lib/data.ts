import type { Word, Sentence, Dialogue, LessonBundle } from './types'

type RawItem = {
  id: string
  translation: string
  original: string
  soundFile: string
  imageSource: string
  unit: number
  lesson: number
  order: number
  transcript: null
  word?: string
  speaker?: number
}

type RawSection = Record<string, { allIds: string[]; byId: Record<string, RawItem> }>

let _initialized = false

export const wordMap = new Map<string, Word>()
export const sentenceMap = new Map<string, Sentence>()
export const dialogueMap = new Map<string, Dialogue>()
const lessonIndex: Record<number, Record<number, LessonBundle>> = {}
// mutable array — mutated in place so existing references stay valid
export const allUnits: number[] = []

export function isInitialized(): boolean {
  return _initialized
}

export function initFromRaw(raw: unknown): void {
  wordMap.clear()
  sentenceMap.clear()
  dialogueMap.clear()
  for (const k of Object.keys(lessonIndex)) delete lessonIndex[+k]
  allUnits.length = 0

  const mt = (raw as { mergedTarget: Record<string, unknown> }).mergedTarget

  for (const group of Object.values(mt.words as RawSection)) {
    for (const item of Object.values(group.byId)) {
      wordMap.set(item.id, item as Word)
    }
  }

  for (const group of Object.values(mt.sentences as RawSection)) {
    for (const item of Object.values(group.byId)) {
      sentenceMap.set(item.id, item as Sentence)
    }
  }

  for (const group of Object.values(mt.dialogues as RawSection)) {
    for (const item of Object.values(group.byId)) {
      dialogueMap.set(item.id, item as Dialogue)
    }
  }

  for (const [key, group] of Object.entries(mt.words as RawSection)) {
    const [unitStr, lessonStr] = key.split(',')
    const unit = parseInt(unitStr)
    const lesson = parseInt(lessonStr)
    if (!lessonIndex[unit]) lessonIndex[unit] = {}
    lessonIndex[unit][lesson] = {
      unit,
      lesson,
      words: group.allIds.map(id => wordMap.get(id)!).filter(Boolean).sort((a, b) => a.order - b.order),
      sentences: [],
      dialogues: [],
    }
  }

  for (const [key, group] of Object.entries(mt.sentences as RawSection)) {
    const [unitStr, lessonStr] = key.split(',')
    const unit = parseInt(unitStr)
    const lesson = parseInt(lessonStr)
    if (!lessonIndex[unit]?.[lesson]) continue
    lessonIndex[unit][lesson].sentences = group.allIds
      .map(id => sentenceMap.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
  }

  for (const [key, group] of Object.entries(mt.dialogues as RawSection)) {
    const [unitStr, lessonStr] = key.split(',')
    const unit = parseInt(unitStr)
    const lesson = parseInt(lessonStr)
    if (!lessonIndex[unit]?.[lesson]) continue
    lessonIndex[unit][lesson].dialogues = group.allIds
      .map(id => dialogueMap.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
  }

  const units = Array.from(new Set(Object.keys(lessonIndex).map(Number))).sort((a, b) => a - b)
  allUnits.push(...units)

  _initialized = true
}

export function getLesson(unit: number, lesson: number): LessonBundle | null {
  return lessonIndex[unit]?.[lesson] ?? null
}

export function getUnit(unit: number): LessonBundle[] {
  const lessons = lessonIndex[unit]
  if (!lessons) return []
  return Object.values(lessons).sort((a, b) => a.lesson - b.lesson)
}

export function getUnitWords(unit: number): Word[] {
  return getUnit(unit).flatMap(l => l.words)
}
