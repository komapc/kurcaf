'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson, getUnitWords } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import { shuffle, buildOptions } from '@/lib/utils'
import { useEnterKey } from '@/hooks/useEnterKey'
import ExerciseShell from '@/components/ExerciseShell'
import ItemImage from '@/components/ItemImage'
import LessonComplete from '@/components/LessonComplete'
import type { Word } from '@/lib/types'

export default function ChoicePage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const words: Word[] = bundle?.words ?? []
  const unitWords = ready ? getUnitWords(parseInt(unit)) : []

  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<Word[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const word = words[index]

  useEffect(() => {
    if (word) setOptions(buildOptions(word, unitWords))
  }, [index, word])

  function next() {
    if (index + 1 >= words.length) { setDone(true) }
    else { setIndex(i => i + 1); setSelected(null) }
  }

  useEnterKey(() => {
    if (done) { router.back(); return }
    if (selected) next()
  }, [done, selected, index])

  if (!ready) return <div className="p-8 text-center text-gray-600">Loading…</div>
  if (!words.length) return <div className="p-8 text-center text-gray-600">No words in this lesson</div>

  if (done) return <LessonComplete onBack={() => router.back()} />

  return (
    <ExerciseShell title="Choose" backHref={`/lesson/${unit}/${lesson}`} current={index} total={words.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <ItemImage src={`/images/${word.id}.png`} alt={word.translation} className="w-full aspect-square" />
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">English</p>
          <p className="text-2xl font-semibold text-gray-900">{word.translation}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {options.map(opt => {
            const isCorrect = opt.id === word.id
            const isSelected = opt.id === selected
            let cls = 'py-4 rounded-2xl text-center font-semibold border-2 transition-all active:scale-95 text-base '
            if (!selected) cls += 'border-gray-200 bg-white text-gray-800 hover:border-amber-300'
            else if (isCorrect) cls += 'border-green-400 bg-green-50 text-green-800'
            else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-700'
            else cls += 'border-gray-100 bg-gray-50 text-gray-500'
            return <button key={opt.id} className={cls} onClick={() => {
              if (selected) return
              setSelected(opt.id)
              recordResult(word.id, opt.id === word.id)
            }}>{opt.original}</button>
          })}
        </div>
        {selected && (
          <button onClick={next} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg">Next →</button>
        )}
      </div>
    </ExerciseShell>
  )
}
