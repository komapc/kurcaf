'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import { shuffle } from '@/lib/utils'
import { useEnterKey } from '@/hooks/useEnterKey'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import LessonComplete from '@/components/LessonComplete'
import MissedRecap from '@/components/MissedRecap'
import type { Word } from '@/lib/types'

export default function FlashcardPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()

  const [words, setWords] = useState<Word[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [missed, setMissed] = useState<Word[]>([])
  const [phase, setPhase] = useState<'exercise' | 'recap' | 'done'>('exercise')

  useEffect(() => {
    if (!ready) return
    const bundle = getLesson(parseInt(unit), parseInt(lesson))
    setWords(shuffle([...(bundle?.words ?? [])]))
    setIndex(0); setFlipped(false); setMissed([]); setPhase('exercise')
  }, [ready, unit, lesson])

  const word = words[index]

  function next(correct: boolean) {
    if (!word) return
    recordResult(word.id, correct)
    const newMissed = correct ? missed : [...missed, word]
    if (index + 1 >= words.length) {
      if (newMissed.length > 0) { setMissed(newMissed); setPhase('recap') }
      else { setPhase('done') }
    } else {
      if (!correct) setMissed(newMissed)
      setIndex(i => i + 1); setFlipped(false)
    }
  }

  function retryMissed() {
    setWords(shuffle([...missed])); setMissed([])
    setIndex(0); setFlipped(false); setPhase('exercise')
  }

  useEnterKey(() => {
    if (phase === 'done') { router.back(); return }
    if (phase === 'recap') return
    if (!flipped) { setFlipped(true) }
    else { next(true) }
  }, [phase, flipped, word, index, missed])

  if (!ready || !words.length) return <div className="p-8 text-center text-gray-600">{ready ? 'No words in this lesson' : 'Loading…'}</div>

  if (phase === 'done') return <LessonComplete onBack={() => router.back()} />

  if (phase === 'recap') {
    return <MissedRecap missed={missed} onRetry={retryMissed} onContinue={() => setPhase('done')} />
  }

  return (
    <ExerciseShell title="Flashcard" backHref={`/lesson/${unit}/${lesson}`} current={index} total={words.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <ItemImage src={`/images/${word.id}.png`} alt={word.translation} className="w-full aspect-square" />
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center select-none transition-transform ${!flipped ? 'cursor-pointer active:scale-95' : ''}`}
          onClick={() => { if (!flipped) setFlipped(true) }}
        >
          {!flipped ? (
            <><p className="text-xs text-gray-600 mb-2">English — tap to reveal</p><p className="text-2xl font-semibold text-gray-800">{word.translation}</p></>
          ) : (
            <><p className="text-xs text-gray-600 mb-2">Latvian</p><p className="text-2xl font-bold text-amber-600">{word.original}</p><div className="flex justify-center mt-3"><AudioButton src={`/audio/${word.soundFile}`} size="md" autoPlay /></div></>
          )}
        </div>
        {flipped && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button onClick={() => next(false)} className="py-4 rounded-2xl bg-red-100 text-red-700 font-semibold text-lg active:scale-95">✗ Wrong</button>
            <button onClick={() => next(true)} className="py-4 rounded-2xl bg-green-100 text-green-700 font-semibold text-lg active:scale-95">✓ Got it</button>
          </div>
        )}
      </div>
    </ExerciseShell>
  )
}
