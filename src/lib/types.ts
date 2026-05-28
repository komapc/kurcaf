export interface Word {
  id: string
  translation: string
  original: string
  soundFile: string
  imageSource: string
  unit: number
  lesson: number
  order: number
}

export interface Sentence {
  id: string
  translation: string
  original: string
  soundFile: string
  imageSource: string
  unit: number
  lesson: number
  order: number
  word: string
}

export interface Dialogue {
  id: string
  translation: string
  original: string
  soundFile: string
  imageSource: string
  unit: number
  lesson: number
  order: number
  speaker: number
}

export interface LessonBundle {
  unit: number
  lesson: number
  words: Word[]
  sentences: Sentence[]
  dialogues: Dialogue[]
}

export interface ItemProgress {
  seen: number
  correct: number
  incorrect: number
}
