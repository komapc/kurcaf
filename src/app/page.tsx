'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { allUnits, getUnit } from '@/lib/data'
import { getLessonProgress } from '@/lib/progress'
import ProgressRing from '@/components/ProgressRing'

function UnitCard({ unit }: { unit: number }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const lessons = getUnit(unit)
    const allIds = lessons.flatMap(l => [...l.words.map(w => w.id), ...l.sentences.map(s => s.id)])
    const { seen, total } = getLessonProgress(allIds)
    setPct(total > 0 ? seen / total : 0)
  }, [unit])

  return (
    <Link href={`/unit/${unit}`}>
      <div className="relative flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square hover:shadow-md active:scale-95 transition-all">
        <ProgressRing value={pct} size={52} stroke={4} />
        <span className="absolute text-sm font-bold text-gray-700">{unit}</span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Latvian</h1>
          <p className="text-sm text-gray-500">50 units · pick one to start</p>
        </div>
        <Link href="/review" className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 transition-colors">
          Weak items
        </Link>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {allUnits.map(u => <UnitCard key={u} unit={u} />)}
      </div>
    </div>
  )
}
