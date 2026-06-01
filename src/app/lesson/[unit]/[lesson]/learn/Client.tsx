'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson } from '@/lib/data'
import { useData } from '@/lib/DataContext'
import { normalize, stripDiacritics } from '@/lib/utils'
import { useEnterKey } from '@/hooks/useEnterKey'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import LessonComplete from '@/components/LessonComplete'
import type { Word, Sentence } from '@/lib/types'

/** True if a sentence token refers to the target word (loose, diacritic-insensitive). */
export function tokenMatchesWord(token: string, word: string): boolean {
  const t = stripDiacritics(normalize(token))
  const w = stripDiacritics(normalize(word))
  if (!t || !w) return false
  if (t === w) return true
  // Only allow inflection-tolerant prefix matching for longer words, so a short
  // word like "ir" doesn't highlight every token that happens to start with "ir".
  if (Math.min(t.length, w.length) < 4) return false
  return t.startsWith(w) || w.startsWith(t)
}

/** Render the sentence with the target word emphasised where it appears. */
function HighlightedSentence({ sentence, word }: { sentence: string; word: string }) {
  return (
    <p className="text-xl font-bold text-gray-900 leading-relaxed">
      {sentence.split(/(\s+)/).map((tok, i) =>
        /\s+/.test(tok) || !tokenMatchesWord(tok, word)
          ? <span key={i}>{tok}</span>
          : <span key={i} className="text-amber-600 underline decoration-amber-300 decoration-2 underline-offset-4">{tok}</span>
      )}
    </p>
  )
}

export default function LearnPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()

  const [words, setWords] = useState<Word[]>([])
  const [sentences, setSentences] = useState<Sentence[]>([])
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<'word' | 'sentence'>('word')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!ready) return
    const bundle = getLesson(parseInt(unit), parseInt(lesson))
    setWords(bundle?.words ?? [])
    setSentences(bundle?.sentences ?? [])
    setIndex(0); setStage('word'); setDone(false)
  }, [ready, unit, lesson])

  const word = words[index]
  // First sentence in the lesson that is built around this word.
  const example = word ? sentences.find(s => s.word === word.id) ?? null : null

  function advance() {
    if (stage === 'word' && example) { setStage('sentence'); return }
    if (index + 1 >= words.length) { setDone(true) }
    else { setIndex(i => i + 1); setStage('word') }
  }

  useEnterKey(() => {
    if (done) { router.back(); return }
    advance()
  }, [done, stage, index, example])

  if (!ready) return <div className="p-8 text-center text-gray-600">Loading…</div>
  if (!words.length) return <div className="p-8 text-center text-gray-600">No words in this lesson</div>
  if (done) return <LessonComplete onBack={() => router.back()} emoji="✅" title="Words learned!" />

  return (
    <ExerciseShell title="Learn" backHref={`/lesson/${unit}/${lesson}`} current={index} total={words.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <ItemImage src={`/images/${word.id}.png`} alt={word.translation} className="w-full aspect-square" />

        {stage === 'word' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">New word</p>
            <p className="text-3xl font-bold text-amber-600 mb-1">{word.original}</p>
            <p className="text-base text-gray-700 mb-3">{word.translation}</p>
            <div className="flex justify-center">
              <AudioButton src={`/audio/${word.soundFile}`} size="md" autoPlay key={word.id} />
            </div>
          </div>
        ) : example ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Used in a sentence</p>
            <HighlightedSentence sentence={example.original} word={word.original} />
            <p className="text-sm text-gray-600 mt-2">{example.translation}</p>
            <div className="flex justify-center mt-3">
              <AudioButton src={`/audio/${example.soundFile}`} size="md" autoPlay key={example.id} />
            </div>
          </div>
        ) : null}

        <button onClick={advance} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg mt-auto">
          {stage === 'word' && example ? 'See it in a sentence →' : 'Next →'}
        </button>
      </div>
    </ExerciseShell>
  )
}
