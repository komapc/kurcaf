'use client'

import Link from 'next/link'

interface Props {
  title: string
  backHref: string
  current: number
  total: number
  children: React.ReactNode
}

export default function ExerciseShell({ title, backHref, current, total, children }: Props) {
  const pct = total > 0 ? current / total : 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3">
        <Link href={backHref} className="text-2xl text-gray-500 hover:text-gray-700 leading-none">‹</Link>
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1">{current} / {total}</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </header>
      <main className="flex-1 px-4 pb-8 flex flex-col">
        {children}
      </main>
    </div>
  )
}
