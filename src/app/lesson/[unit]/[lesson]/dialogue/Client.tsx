'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getLesson } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import type { Dialogue } from '@/lib/types'

export default function DialoguePage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const dialogues: Dialogue[] = bundle?.dialogues ?? []

  function markDone() {
    dialogues.forEach(d => recordResult(d.id, true))
    router.back()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') markDone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialogues])

  if (!ready) return <div className="p-8 text-center text-gray-600">Loading…</div>
  if (!dialogues.length) return <div className="p-8 text-center text-gray-600">No dialogue in this lesson</div>

  return (
    <ExerciseShell title="Dialogue" backHref={`/lesson/${unit}/${lesson}`} current={dialogues.length} total={dialogues.length}>
      <div className="flex-1 flex flex-col gap-3 pt-4 pb-6">
        {dialogues.map(line => (
          <div key={line.id} className={`flex items-end gap-2 ${line.speaker === 1 ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex flex-col gap-1 max-w-[78%] ${line.speaker === 1 ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 shadow-sm ${line.speaker === 1 ? 'bg-amber-400 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                <p className="font-medium text-base">{line.original}</p>
                <p className={`text-xs mt-1 ${line.speaker === 1 ? 'text-amber-100' : 'text-gray-500'}`}>{line.translation}</p>
              </div>
            </div>
            <AudioButton src={`/audio/${line.soundFile}`} size="sm" />
          </div>
        ))}
        <button onClick={markDone} className="mt-6 w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg">
          Done
        </button>
      </div>
    </ExerciseShell>
  )
}
