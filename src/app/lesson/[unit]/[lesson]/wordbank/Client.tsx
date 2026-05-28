'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import type { Sentence } from '@/lib/types'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Split sentence into word tokens, stripping trailing punctuation into separate token
function tokenize(text: string): string[] {
  return text.match(/[^\s]+/g) ?? []
}

function normalize(s: string) {
  return s.replace(/[.,!?;:…]+$/, '').toLowerCase()
}

function checkAssembled(assembled: string[], original: string): boolean {
  const a = assembled.map(normalize).join(' ')
  const b = tokenize(original).map(normalize).join(' ')
  return a === b
}

export default function WordBankPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const sentences: Sentence[] = bundle?.sentences ?? []

  const [index, setIndex] = useState(0)
  const [bank, setBank] = useState<string[]>([])       // chips still available
  const [assembled, setAssembled] = useState<string[]>([]) // chips placed by user
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [done, setDone] = useState(false)

  const sentence = sentences[index]

  useEffect(() => {
    if (sentence) {
      setBank(shuffle(tokenize(sentence.original)))
      setAssembled([])
      setChecked(false)
      setCorrect(false)
    }
  }, [index, sentence])

  function tapBank(i: number) {
    if (checked) return
    const token = bank[i]
    setBank(b => b.filter((_, idx) => idx !== i))
    setAssembled(a => [...a, token])
  }

  function tapAssembled(i: number) {
    if (checked) return
    const token = assembled[i]
    setAssembled(a => a.filter((_, idx) => idx !== i))
    setBank(b => [...b, token])
  }

  function check() {
    if (checked || assembled.length === 0) return
    const ok = checkAssembled(assembled, sentence.original)
    setCorrect(ok)
    setChecked(true)
    recordResult(sentence.id, ok)
  }

  function next() {
    if (index + 1 >= sentences.length) { setDone(true) }
    else { setIndex(i => i + 1) }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if (done) { router.back(); return }
      if (checked) { next(); return }
      if (assembled.length > 0) check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, checked, assembled, index])

  if (!ready) return <div className="p-8 text-center text-gray-600">Loading…</div>
  if (!sentences.length) return <div className="p-8 text-center text-gray-600">No sentences in this lesson</div>

  if (done) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">Lesson complete!</h2>
        <button onClick={() => router.back()} className="px-6 py-3 bg-amber-400 text-white rounded-2xl font-semibold text-lg">Back to lesson</button>
      </div>
    )
  }

  const resultColor = !checked ? 'border-gray-200 bg-gray-50'
    : correct ? 'border-green-400 bg-green-50'
    : 'border-red-400 bg-red-50'

  return (
    <ExerciseShell title="Word bank" backHref={`/lesson/${unit}/${lesson}`} current={index} total={sentences.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        {/* English prompt */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">English</p>
          <p className="text-lg font-medium text-gray-900">{sentence.translation}</p>
        </div>

        {/* Assembly area */}
        <div className={`min-h-[72px] rounded-2xl border-2 p-3 flex flex-wrap gap-2 transition-colors ${resultColor}`}>
          {assembled.length === 0 && !checked && (
            <span className="text-gray-400 text-sm self-center">Tap words below to build the sentence…</span>
          )}
          {assembled.map((token, i) => (
            <button
              key={i}
              onClick={() => tapAssembled(i)}
              disabled={checked}
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-white font-medium text-base shadow-sm active:scale-95 disabled:opacity-70"
            >
              {token}
            </button>
          ))}
        </div>

        {/* Result feedback */}
        {checked && (
          <div className="flex items-center gap-2">
            {correct
              ? <span className="text-sm font-semibold text-green-700">✓ Correct!</span>
              : <span className="text-sm text-red-700">Correct: <span className="font-semibold text-gray-800">{sentence.original}</span></span>
            }
            <AudioButton src={`/audio/${sentence.soundFile}`} size="sm" />
          </div>
        )}

        {/* Word bank chips */}
        <div className="flex flex-wrap gap-2">
          {bank.map((token, i) => (
            <button
              key={i}
              onClick={() => tapBank(i)}
              disabled={checked}
              className="px-3 py-1.5 rounded-xl bg-white border-2 border-gray-200 text-gray-800 font-medium text-base active:scale-95 hover:border-amber-300 disabled:opacity-40"
            >
              {token}
            </button>
          ))}
        </div>

        {!checked ? (
          <button onClick={check} disabled={assembled.length === 0}
            className="w-full py-4 bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-semibold text-lg mt-auto">
            Check
          </button>
        ) : (
          <button onClick={next} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg mt-auto">
            Next
          </button>
        )}
      </div>
    </ExerciseShell>
  )
}
