'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { getLesson, wordMap } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import { lessonParams } from '@/lib/staticParams'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import type { Sentence } from '@/lib/types'

export function generateStaticParams() { return lessonParams() }

function normalize(s: string) {
  return s.trim().toLowerCase()
}

export default function FillPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const sentences: Sentence[] = bundle?.sentences ?? []

  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [done, setDone] = useState(false)

  const sentence = sentences[index]

  function check() {
    if (checked || !sentence) return
    const targetWord = wordMap.get(sentence.word)
    const answer = targetWord?.original ?? ''
    const isCorrect = normalize(input) === normalize(answer)
    setCorrect(isCorrect)
    setChecked(true)
    recordResult(sentence.id, isCorrect)
  }

  function next() {
    if (index + 1 >= sentences.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setInput('')
      setChecked(false)
      setCorrect(false)
    }
  }

  if (!ready) return <div className="p-8 text-center text-gray-400">Loading…</div>
  if (!sentences.length) return <div className="p-8 text-center text-gray-400">No sentences in this lesson</div>

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

  const targetWord = wordMap.get(sentence.word)
  const answer = targetWord?.original ?? ''

  const blanked = sentence.original.replace(
    new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    '_____'
  )

  return (
    <ExerciseShell title="Fill in" backHref={`/lesson/${unit}/${lesson}`} current={index} total={sentences.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <ItemImage src={`/images/${sentence.id}.png`} alt={sentence.translation} className="w-full aspect-video" />
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-400 mb-1">English</p>
          <p className="text-base text-gray-700">{sentence.translation}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-400 mb-1">Latvian — fill in the blank</p>
          <p className="text-base text-gray-600 mb-3">{blanked}</p>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !checked && check()}
            disabled={checked}
            placeholder="Type the missing word..."
            className={`w-full px-4 py-3 rounded-xl border-2 text-base outline-none transition-colors
              ${checked
                ? correct
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-red-400 bg-red-50 text-red-600'
                : 'border-gray-200 focus:border-amber-400'
              }`}
          />
          {checked && !correct && (
            <div className="flex items-center gap-2 mt-3">
              <p className="text-sm text-gray-500">Correct: <span className="font-semibold text-amber-600">{answer}</span></p>
              <AudioButton src={`/audio/${sentence.soundFile}`} size="sm" />
            </div>
          )}
        </div>

        {!checked ? (
          <button
            onClick={check}
            disabled={!input.trim()}
            className="w-full py-4 bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-semibold text-lg"
          >
            Check
          </button>
        ) : (
          <button onClick={next} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg">
            Next
          </button>
        )}
      </div>
    </ExerciseShell>
  )
}
