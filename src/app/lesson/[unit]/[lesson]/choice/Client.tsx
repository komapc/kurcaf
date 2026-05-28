'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLesson, getUnitWords } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import type { Sentence, Word } from '@/lib/types'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function ChoicePage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const sentences: Sentence[] = bundle?.sentences ?? []
  const unitWords = getUnitWords(parseInt(unit))

  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const sentence = sentences[index]

  useEffect(() => {
    if (!sentence) return
    const distractors = shuffle(unitWords.filter(w => w.id !== sentence.word))
      .slice(0, 3)
      .map(w => w.original)
    const correctWord = unitWords.find(w => w.id === sentence.word)
    const correct = correctWord?.original ?? sentence.original
    setOptions(shuffle([correct, ...distractors]))
  }, [index, sentence])

  function choose(opt: string) {
    if (selected) return
    const correctWord = unitWords.find(w => w.id === sentence.word)
    const correct = correctWord?.original ?? sentence.original
    setSelected(opt)
    recordResult(sentence.id, opt === correct)
  }

  function next() {
    if (index + 1 >= sentences.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setSelected(null)
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

  const correctWord = unitWords.find(w => w.id === sentence.word)
  const correct = correctWord?.original ?? sentence.original

  return (
    <ExerciseShell title="Choose" backHref={`/lesson/${unit}/${lesson}`} current={index} total={sentences.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <ItemImage src={`/images/${sentence.id}.png`} alt={sentence.translation} className="w-full aspect-video" />
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
          <AudioButton src={`/audio/${sentence.soundFile}`} size="sm" />
          <p className="text-base text-gray-700 leading-relaxed flex-1">{sentence.translation}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {options.map(opt => {
            const isCorrect = opt === correct
            const isSelected = opt === selected
            let cls = 'py-4 rounded-2xl text-center font-medium border-2 transition-all active:scale-95 text-sm '
            if (!selected) cls += 'border-gray-200 bg-white text-gray-800 hover:border-amber-300'
            else if (isCorrect) cls += 'border-green-400 bg-green-50 text-green-700'
            else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-600'
            else cls += 'border-gray-100 bg-gray-50 text-gray-400'
            return (
              <button key={opt} className={cls} onClick={() => choose(opt)}>{opt}</button>
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
