'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUnit } from '@/lib/data'
import { getLessonProgress } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import ProgressRing from '@/components/ProgressRing'
import type { LessonBundle } from '@/lib/types'


const MODE_LABELS = [
  { key: 'flashcard', label: 'Flashcard', emoji: '🃏' },
  { key: 'listen', label: 'Listen', emoji: '🎧' },
  { key: 'choice', label: 'Choice', emoji: '🔤' },
  { key: 'fill', label: 'Fill', emoji: '✏️' },
  { key: 'dialogue', label: 'Dialogue', emoji: '💬' },
]

function LessonCard({ bundle, unit }: { bundle: LessonBundle; unit: number }) {
  const [pct, setPct] = useState(0)
  const allIds = [...bundle.words.map(w => w.id), ...bundle.sentences.map(s => s.id)]

  useEffect(() => {
    const { seen, total } = getLessonProgress(allIds)
    setPct(total > 0 ? seen / total : 0)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-4">
        <ProgressRing value={pct} size={40} stroke={4} />
        <div>
          <div className="font-semibold text-gray-800">Lesson {bundle.lesson}</div>
          <div className="text-xs text-gray-600">{bundle.words.length} words · {bundle.sentences.length} sentences</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {MODE_LABELS.map(m => (
          <Link
            key={m.key}
            href={`/lesson/${unit}/${bundle.lesson}/${m.key}`}
            className="flex flex-col items-center gap-1 py-2 rounded-xl bg-gray-50 hover:bg-amber-50 active:scale-95 transition-all"
          >
            <span className="text-lg">{m.emoji}</span>
            <span className="text-[10px] text-gray-500">{m.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function UnitPage() {
  const { unit } = useParams<{ unit: string }>()
  const { ready } = useData()
  const unitNum = parseInt(unit)
  const lessons = ready ? getUnit(unitNum) : []

  if (!ready) {
    return <div className="p-8 text-center text-gray-600">Loading…</div>
  }

  if (!lessons.length) {
    return <div className="p-8 text-center text-gray-600">Unit not found</div>
  }

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">Unit {unitNum}</h1>
      </div>
      <div className="flex flex-col gap-4">
        {lessons.map(l => <LessonCard key={l.lesson} bundle={l} unit={unitNum} />)}
      </div>
    </div>
  )
}
