'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson, getUnitWords } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import { buildOptions } from '@/lib/utils'
import { useEnterKey } from '@/hooks/useEnterKey'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import LessonComplete from '@/components/LessonComplete'
import type { Word } from '@/lib/types'

export default function ListenPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const words: Word[] = bundle?.words ?? []
  const unitPool = ready ? getUnitWords(parseInt(unit)) : []

  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<Word[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const word = words[index]

  useEffect(() => {
    if (word) setOptions(buildOptions(word, unitPool))
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
    <ExerciseShell title="Listen" backHref={`/lesson/${unit}/${lesson}`} current={index} total={words.length}>
      <div className="flex-1 flex flex-col items-center gap-6 pt-8">
        <p className="text-gray-600 text-sm">Listen and choose the Latvian word</p>
        <AudioButton src={`/audio/${word.soundFile}`} size="lg" autoPlay key={word.id} />
        <p className="text-base text-gray-600 italic">{word.translation}</p>
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          {options.map(opt => {
            const isCorrect = opt.id === word.id
            const isSelected = opt.id === selected
            let cls = 'py-5 rounded-2xl text-center font-semibold text-lg border-2 transition-all active:scale-95 '
            if (!selected) cls += 'border-gray-200 bg-white text-gray-800 hover:border-amber-300'
            else if (isCorrect) cls += 'border-green-400 bg-green-50 text-green-800'
            else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-700'
            else cls += 'border-gray-100 bg-gray-50 text-gray-500'
            return (
              <button key={opt.id} className={cls} onClick={() => {
                if (selected) return
                setSelected(opt.id)
                recordResult(word.id, opt.id === word.id)
              }}>{opt.original}</button>
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
