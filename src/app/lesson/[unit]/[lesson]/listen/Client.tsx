'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson, getUnitWords } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import type { Word } from '@/lib/types'


function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildOptions(correct: Word, pool: Word[]): Word[] {
  const distractors = shuffle(pool.filter(w => w.id !== correct.id)).slice(0, 3)
  return shuffle([correct, ...distractors])
}

export default function ListenPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const words: Word[] = bundle?.words ?? []
  const unitPool = getUnitWords(parseInt(unit))

  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<Word[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const word = words[index]

  useEffect(() => {
    if (word) setOptions(buildOptions(word, unitPool))
  }, [index, word])

  function choose(id: string) {
    if (selected) return
    setSelected(id)
    recordResult(word.id, id === word.id)
  }

  function next() {
    if (index + 1 >= words.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setSelected(null)
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
    <ExerciseShell title="Listen" backHref={`/lesson/${unit}/${lesson}`} current={index} total={words.length}>
      <div className="flex-1 flex flex-col items-center gap-6 pt-8">
        <p className="text-gray-500 text-sm">Listen and choose the Latvian word</p>
        <AudioButton src={`/audio/${word.soundFile}`} size="lg" autoPlay key={word.id} />
        <p className="text-base text-gray-400 italic">{word.translation}</p>

        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          {options.map(opt => {
            const isCorrect = opt.id === word.id
            const isSelected = opt.id === selected
            let cls = 'py-5 rounded-2xl text-center font-semibold text-lg border-2 transition-all active:scale-95 '
            if (!selected) cls += 'border-gray-200 bg-white text-gray-800 hover:border-amber-300'
            else if (isCorrect) cls += 'border-green-400 bg-green-50 text-green-700'
            else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-600'
            else cls += 'border-gray-100 bg-gray-50 text-gray-400'

            return (
              <button key={opt.id} className={cls} onClick={() => choose(opt.id)}>
                {opt.original}
              </button>
            )
          })}
        </div>

        {selected && (
          <button onClick={next} className="mt-4 w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg">
            Next →
          </button>
        )}
      </div>
    </ExerciseShell>
  )
}
