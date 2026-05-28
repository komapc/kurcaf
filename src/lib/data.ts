import rawData from '@/data/lv_Latvian.json'
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

const mt = (rawData as { mergedTarget: Record<string, unknown> }).mergedTarget

const wordMap = new Map<string, Word>()
const sentenceMap = new Map<string, Sentence>()
const dialogueMap = new Map<string, Dialogue>()

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

// Build lessonIndex[unit][lesson]
const lessonIndex: Record<number, Record<number, LessonBundle>> = {}

const wordSection = mt.words as RawSection
for (const [key, group] of Object.entries(wordSection)) {
  const [unitStr, lessonStr] = key.split(',')
  const unit = parseInt(unitStr)
  const lesson = parseInt(lessonStr)
  if (!lessonIndex[unit]) lessonIndex[unit] = {}
  if (!lessonIndex[unit][lesson]) {
    lessonIndex[unit][lesson] = { unit, lesson, words: [], sentences: [], dialogues: [] }
  }
  lessonIndex[unit][lesson].words = group.allIds
    .map(id => wordMap.get(id)!)
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
}

const sentenceSection = mt.sentences as RawSection
for (const [key, group] of Object.entries(sentenceSection)) {
  const [unitStr, lessonStr] = key.split(',')
  const unit = parseInt(unitStr)
  const lesson = parseInt(lessonStr)
  if (!lessonIndex[unit]?.[lesson]) continue
  lessonIndex[unit][lesson].sentences = group.allIds
    .map(id => sentenceMap.get(id)!)
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
}

const dialogueSection = mt.dialogues as RawSection
for (const [key, group] of Object.entries(dialogueSection)) {
  const [unitStr, lessonStr] = key.split(',')
  const unit = parseInt(unitStr)
  const lesson = parseInt(lessonStr)
  if (!lessonIndex[unit]?.[lesson]) continue
  lessonIndex[unit][lesson].dialogues = group.allIds
    .map(id => dialogueMap.get(id)!)
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
}

export const allUnits: number[] = Array.from(
  new Set(Object.keys(lessonIndex).map(Number))
).sort((a, b) => a - b)

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

export { wordMap, sentenceMap, dialogueMap }
