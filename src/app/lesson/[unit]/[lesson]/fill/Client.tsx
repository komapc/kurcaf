'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import { shuffle, stripDiacritics } from '@/lib/utils'
import { useEnterKey } from '@/hooks/useEnterKey'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import LessonComplete from '@/components/LessonComplete'
import MissedRecap from '@/components/MissedRecap'
import type { Word } from '@/lib/types'

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

  const [words, setWords] = useState<Word[]>([])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [missed, setMissed] = useState<Word[]>([])
  const [phase, setPhase] = useState<'exercise' | 'recap' | 'done'>('exercise')

  useEffect(() => {
    if (!ready) return
    const bundle = getLesson(parseInt(unit), parseInt(lesson))
    setWords(shuffle([...(bundle?.words ?? [])]))
    setIndex(0); setInput(''); setResult(null); setMissed([]); setPhase('exercise')
  }, [ready, unit, lesson])

  const word = words[index]

  function check() {
    if (result || !word) return
    const r = checkAnswer(input, word.original)
    setResult(r)
    recordResult(word.id, r !== 'wrong')
  }

  function next() {
    const newMissed = result === 'wrong' ? [...missed, word] : missed
    if (index + 1 >= words.length) {
      if (newMissed.length > 0) { setMissed(newMissed); setPhase('recap') }
      else { setPhase('done') }
    } else {
      if (result === 'wrong') setMissed(newMissed)
      setIndex(i => i + 1); setInput(''); setResult(null)
    }
  }

  function retryMissed() {
    setWords(shuffle([...missed])); setMissed([])
    setIndex(0); setInput(''); setResult(null); setPhase('exercise')
  }

  useEnterKey(() => {
    if (phase === 'done') { router.back(); return }
    if (phase === 'recap') return
    if (result) { next(); return }
    if (input.trim()) check()
  }, [phase, result, input, index, missed])

  if (!ready || !words.length) return <div className="p-8 text-center text-gray-600">{ready ? 'No words in this lesson' : 'Loading…'}</div>

  if (phase === 'done') return <LessonComplete onBack={() => router.back()} />

  if (phase === 'recap') {
    return <MissedRecap missed={missed} onRetry={retryMissed} onContinue={() => setPhase('done')} />
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
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            disabled={!!result} placeholder="Latvian word…" autoFocus className={inputCls} />
          {result === 'exact' && <div className="flex items-center gap-2 mt-3"><span className="text-sm font-semibold text-green-700">✓ Perfect!</span><AudioButton src={`/audio/${word.soundFile}`} size="sm" /></div>}
          {result === 'almost' && <div className="flex items-center gap-2 mt-3"><span className="text-sm text-amber-700">Almost! Correct: <span className="font-bold">{word.original}</span></span><AudioButton src={`/audio/${word.soundFile}`} size="sm" /></div>}
          {result === 'wrong' && <div className="flex items-center gap-2 mt-3"><span className="text-sm text-red-700">Correct: <span className="font-bold text-amber-700">{word.original}</span></span><AudioButton src={`/audio/${word.soundFile}`} size="sm" /></div>}
        </div>
        {!result
          ? <button onClick={check} disabled={!input.trim()} className="w-full py-4 bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-semibold text-lg">Check</button>
          : <button onClick={next} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg">Next</button>
        }
      </div>
    </ExerciseShell>
  )
}
