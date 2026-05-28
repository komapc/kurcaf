'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { getLesson } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import { lessonParams } from '@/lib/staticParams'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import type { Word } from '@/lib/types'

export function generateStaticParams() { return lessonParams() }

export default function FlashcardPage() {
  const { ready } = useData()
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const words: Word[] = bundle?.words ?? []

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  const word = words[index]

  function next(correct: boolean) {
    if (!word) return
    recordResult(word.id, correct)
    if (index + 1 >= words.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  if (!ready) return <div className="p-8 text-center text-gray-400">Loading…</div>
  if (!words.length) return <div className="p-8 text-center text-gray-400">No words in this lesson</div>

  if (done) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">Lesson complete!</h2>
        <button onClick={() => router.back()} className="px-6 py-3 bg-amber-400 text-white rounded-2xl font-semibold text-lg">
          Back to lesson
        </button>
      </div>
    )
  }

  return (
    <ExerciseShell title="Flashcard" backHref={`/lesson/${unit}/${lesson}`} current={index} total={words.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <ItemImage
          src={`/images/${word.id}.png`}
          alt={word.translation}
          className="w-full aspect-square"
        />
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center select-none transition-transform ${!flipped ? 'cursor-pointer active:scale-95' : ''}`}
          onClick={() => { if (!flipped) setFlipped(true) }}
        >
          {!flipped ? (
            <>
              <p className="text-xs text-gray-400 mb-2">English — tap to reveal</p>
              <p className="text-2xl font-semibold text-gray-800">{word.translation}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-2">Latvian</p>
              <p className="text-2xl font-bold text-amber-600">{word.original}</p>
              <div className="flex justify-center mt-3">
                <AudioButton src={`/audio/${word.soundFile}`} size="md" autoPlay />
              </div>
            </>
          )}
        </div>

        {flipped && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => next(false)}
              className="py-4 rounded-2xl bg-red-100 text-red-600 font-semibold text-lg active:scale-95 transition-transform"
            >
              ✗ Wrong
            </button>
            <button
              onClick={() => next(true)}
              className="py-4 rounded-2xl bg-green-100 text-green-600 font-semibold text-lg active:scale-95 transition-transform"
            >
              ✓ Got it
            </button>
          </div>
        )}
      </div>
    </ExerciseShell>
  )
}
