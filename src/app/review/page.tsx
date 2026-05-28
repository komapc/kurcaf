'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { wordMap, sentenceMap } from '@/lib/data'
import { getWeak, recordResult } from '@/lib/progress'
import AudioButton from '@/components/AudioButton'
import ItemImage from '@/components/ItemImage'
import type { Word, Sentence } from '@/lib/types'

type ReviewItem =
  | { type: 'word'; item: Word }
  | { type: 'sentence'; item: Sentence }

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function ReviewPage() {
  const router = useRouter()
  const [items, setItems] = useState<ReviewItem[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const weakIds = getWeak()
    const collected: ReviewItem[] = []
    for (const id of weakIds) {
      const word = wordMap.get(id)
      if (word) { collected.push({ type: 'word', item: word }); continue }
      const sentence = sentenceMap.get(id)
      if (sentence) collected.push({ type: 'sentence', item: sentence })
    }
    setItems(shuffle(collected))
  }, [])

  const current = items[index]

  function next(correct: boolean) {
    if (!current) return
    recordResult(current.item.id, correct)
    if (index + 1 >= items.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  if (done || items.length === 0) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-5xl">{items.length === 0 ? '✨' : '🎉'}</div>
        <h2 className="text-xl font-bold text-gray-800">
          {items.length === 0 ? 'No weak items yet!' : 'Review done!'}
        </h2>
        <p className="text-gray-500 text-sm text-center">
          {items.length === 0
            ? 'Complete some lessons first, then come back here to review tricky items.'
            : 'Keep practising to reinforce your weak spots.'}
        </p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-amber-400 text-white rounded-2xl font-semibold text-lg">
          Back to units
        </button>
      </div>
    )
  }

  const label = current.type === 'word'
    ? (current.item as Word).translation
    : (current.item as Sentence).translation
  const original = current.item.original

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={() => router.push('/')} className="text-2xl text-gray-600">‹</button>
        <div className="flex-1">
          <div className="text-xs text-gray-600 mb-1">{index + 1} / {items.length}</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
          </div>
        </div>
        <span className="text-sm font-medium text-gray-500">Weak items</span>
      </header>

      <main className="flex-1 px-4 pb-8 flex flex-col gap-4 pt-4">
        <ItemImage src={`/images/${current.item.id}.png`} alt={label} className="w-full aspect-square" />
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center cursor-pointer"
          onClick={() => setFlipped(f => !f)}
        >
          {!flipped ? (
            <>
              <p className="text-xs text-gray-600 mb-2">{current.type === 'word' ? 'Word' : 'Sentence'} — tap to reveal</p>
              <p className="text-xl font-semibold text-gray-800">{label}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600 mb-2">Latvian</p>
              <p className="text-xl font-bold text-amber-600">{original}</p>
              <div className="flex justify-center mt-3">
                <AudioButton src={`/audio/${current.item.soundFile}`} size="md" autoPlay />
              </div>
            </>
          )}
        </div>

        {flipped && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => next(false)} className="py-4 rounded-2xl bg-red-100 text-red-600 font-semibold text-lg active:scale-95">
              ✗ Wrong
            </button>
            <button onClick={() => next(true)} className="py-4 rounded-2xl bg-green-100 text-green-600 font-semibold text-lg active:scale-95">
              ✓ Got it
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
