'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson, getUnit } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import { shuffle, buildOptions } from '@/lib/utils'
import { useEnterKey } from '@/hooks/useEnterKey'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import LessonComplete from '@/components/LessonComplete'
import type { Sentence } from '@/lib/types'

export default function SentencesPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const [sentences, setSentences] = useState<Sentence[]>([])

  useEffect(() => {
    if (!ready) return
    const b = getLesson(parseInt(unit), parseInt(lesson))
    setSentences(shuffle([...(b?.sentences ?? [])]))
  }, [ready, unit, lesson])
  // pool = all sentences in the unit across every lesson
  const unitSentences = ready ? getUnit(parseInt(unit)).flatMap(l => l.sentences) : []

  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<Sentence[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const sentence = sentences[index]

  useEffect(() => {
    if (sentence) setOptions(buildOptions(sentence, unitSentences))
  }, [index, sentence])

  function choose(id: string) {
    if (selected) return
    setSelected(id)
    recordResult(sentence.id, id === sentence.id)
  }

  function next() {
    if (index + 1 >= sentences.length) { setDone(true) }
    else { setIndex(i => i + 1); setSelected(null) }
  }

  useEnterKey(() => {
    if (done) { router.back(); return }
    if (selected) next()
  }, [done, selected, index])

  if (!ready) return <div className="p-8 text-center text-gray-600">Loading…</div>
  if (!sentences.length) return <div className="p-8 text-center text-gray-600">No sentences in this lesson</div>

  if (done) return <LessonComplete onBack={() => router.back()} />

  return (
    <ExerciseShell title="Sentences" backHref={`/lesson/${unit}/${lesson}`} current={index} total={sentences.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">English</p>
          <p className="text-lg font-medium text-gray-900">{sentence.translation}</p>
        </div>
        <p className="text-xs text-center text-gray-500 font-medium uppercase tracking-wide">Pick the Latvian sentence</p>
        <div className="flex flex-col gap-3">
          {options.map(opt => {
            const isCorrect = opt.id === sentence.id
            const isSelected = opt.id === selected
            let cls = 'w-full text-left px-4 py-4 rounded-2xl border-2 transition-all text-base font-medium '
            if (!selected) cls += 'border-gray-200 bg-white text-gray-800 hover:border-amber-300 active:scale-[0.98]'
            else if (isCorrect) cls += 'border-green-400 bg-green-50 text-green-800'
            else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-700'
            else cls += 'border-gray-100 bg-gray-50 text-gray-400'
            return (
              <div key={opt.id} className="flex items-center gap-2">
                <button className={cls} onClick={() => choose(opt.id)}>{opt.original}</button>
                {selected && isCorrect && <AudioButton src={`/audio/${opt.soundFile}`} size="sm" />}
              </div>
            )
          })}
        </div>
        {selected && (
          <button onClick={next} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg">
            Next →
          </button>
        )}
      </div>
    </ExerciseShell>
  )
}
