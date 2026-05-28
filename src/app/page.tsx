'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { allUnits, getUnit } from '@/lib/data'
import { getLessonProgress } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
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

function SetupScreen() {
  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center px-8 gap-6">
      <div className="text-5xl">🇱🇻</div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kurcaf</h1>
        <p className="text-gray-500 text-sm">No course data yet. Load it once and it stays on your device.</p>
      </div>
      <Link
        href="/settings"
        className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg text-center"
      >
        Load course data →
      </Link>
    </div>
  )
}

export default function HomePage() {
  const { ready } = useData()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  if (!ready) return <SetupScreen />

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Latvian</h1>
          <p className="text-sm text-gray-500">{allUnits.length} units · pick one to start</p>
        </div>
        <div className="flex gap-2">
          <Link href="/review" className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 transition-colors">
            Weak items
          </Link>
          <Link href="/settings" className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            ⚙
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {allUnits.map(u => <UnitCard key={u} unit={u} />)}
      </div>
    </div>
  )
}
