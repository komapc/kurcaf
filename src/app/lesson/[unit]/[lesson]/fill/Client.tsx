'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import type { Word } from '@/lib/types'

function stripDiacritics(s: string) {
  return s.trim().toLowerCase()
    .replace(/ā/g, 'a').replace(/ē/g, 'e').replace(/ī/g, 'i').replace(/ū/g, 'u')
    .replace(/ņ/g, 'n').replace(/ļ/g, 'l').replace(/ķ/g, 'k').replace(/ģ/g, 'g')
    .replace(/š/g, 's').replace(/ž/g, 'z').replace(/č/g, 'c')
}

type CheckResult = 'exact' | 'almost' | 'wrong'

function checkAnswer(input: string, answer: string): CheckResult {
  const t = input.trim()
  if (t.toLowerCase() === answer.toLowerCase()) return 'exact'
  if (stripDiacritics(t) === stripDiacritics(answer)) return 'almost'
  return 'wrong'
}

export default function FillPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const words: Word[] = bundle?.words ?? []

  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [done, setDone] = useState(false)

  const word = words[index]

  function check() {
    if (result || !word) return
    const r = checkAnswer(input, word.original)
    setResult(r)
    recordResult(word.id, r !== 'wrong')
  }

  function next() {
    if (index + 1 >= words.length) { setDone(true) }
    else { setIndex(i => i + 1); setInput(''); setResult(null) }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if (done) { router.back(); return }
      if (result) { next(); return }
      if (input.trim()) check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, result, input, index])

  if (!ready) return <div className="p-8 text-center text-gray-600">Loading…</div>
  if (!words.length) return <div className="p-8 text-center text-gray-600">No words in this lesson</div>

  if (done) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">Lesson complete!</h2>
        <button onClick={() => router.back()} className="px-6 py-3 bg-amber-400 text-white rounded-2xl font-semibold text-lg">Back to lesson</button>
      </div>
    )
  }

  const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-base outline-none transition-colors ${
    !result                ? 'border-gray-300 focus:border-amber-400 text-gray-900' :
    result === 'exact'     ? 'border-green-400 bg-green-50 text-green-800' :
    result === 'almost'    ? 'border-amber-400 bg-amber-50 text-amber-800' :
                             'border-red-400   bg-red-50   text-red-700'
  }`

  return (
    <ExerciseShell title="Fill in" backHref={`/lesson/${unit}/${lesson}`} current={index} total={words.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <ItemImage src={`/images/${word.id}.png`} alt={word.translation} className="w-full aspect-square" />
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">English</p>
          <p className="text-2xl font-semibold text-gray-900">{word.translation}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Type in Latvian</p>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!!result}
            placeholder="Latvian word…"
            autoFocus
            className={inputCls}
          />
          {result === 'exact' && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-semibold text-green-700">✓ Perfect!</span>
              <AudioButton src={`/audio/${word.soundFile}`} size="sm" />
            </div>
          )}
          {result === 'almost' && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-amber-700">Almost! Correct spelling: <span className="font-bold">{word.original}</span></span>
              <AudioButton src={`/audio/${word.soundFile}`} size="sm" />
            </div>
          )}
          {result === 'wrong' && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-red-700">Correct: <span className="font-bold text-amber-700">{word.original}</span></span>
              <AudioButton src={`/audio/${word.soundFile}`} size="sm" />
            </div>
          )}
        </div>

        {!result ? (
          <button onClick={check} disabled={!input.trim()}
            className="w-full py-4 bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-semibold text-lg">
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
