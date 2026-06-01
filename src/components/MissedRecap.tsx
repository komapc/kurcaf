'use client'

import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import type { Word } from '@/lib/types'

interface Props {
  missed: Word[]
  onRetry: () => void
  onContinue: () => void
}

/** Shared "Review missed" screen listing the items the learner got wrong. */
export default function MissedRecap({ missed, onRetry, onContinue }: Props) {
  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col px-4 py-8 gap-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onContinue} className="text-2xl text-gray-600">‹</button>
        <h2 className="text-lg font-bold text-gray-800">Review missed ({missed.length})</h2>
      </div>
      <div className="flex flex-col gap-3">
        {missed.map(w => (
          <div key={w.id} className="bg-white rounded-2xl border border-red-100 p-4 flex items-center gap-4">
            <ItemImage src={`/images/${w.id}.png`} alt={w.translation} className="w-14 h-14 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{w.translation}</p>
              <p className="text-lg font-bold text-amber-600">{w.original}</p>
            </div>
            <AudioButton src={`/audio/${w.soundFile}`} size="sm" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button onClick={onRetry} className="py-4 rounded-2xl bg-amber-400 text-white font-semibold">Try again</button>
        <button onClick={onContinue} className="py-4 rounded-2xl bg-gray-100 text-gray-700 font-semibold">Continue</button>
      </div>
    </div>
  )
}
