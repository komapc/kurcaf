'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { getLesson } from '@/lib/data'
import { recordResult } from '@/lib/progress'
import { useData } from '@/lib/DataContext'
import ExerciseShell from '@/components/ExerciseShell'
import AudioButton from '@/components/AudioButton'
import type { Sentence } from '@/lib/types'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function tokenize(text: string): string[] {
  return (text.match(/[^\s]+/g) ?? []).filter(t => !/^\(.*\)$/.test(t))
}

function stripPunct(s: string) {
  return s.replace(/[.,!?;:…]+$/, '')
}

function normalize(s: string) {
  return stripPunct(s).toLowerCase()
}

function checkAssembled(assembled: string[], original: string): boolean {
  return assembled.map(normalize).join(' ') === tokenize(original).map(normalize).join(' ')
}

// Each chip has a unique key so React can track it through reorders
type Chip = { id: string; text: string }

function makeChips(tokens: string[]): Chip[] {
  return tokens.map((text, i) => ({ id: `${text}-${i}-${Math.random()}`, text: stripPunct(text) }))
}

export default function WordBankPage() {
  const { unit, lesson } = useParams<{ unit: string; lesson: string }>()
  const router = useRouter()
  const { ready } = useData()
  const bundle = ready ? getLesson(parseInt(unit), parseInt(lesson)) : null
  const sourceSentences: Sentence[] = bundle?.sentences ?? []

  const [sentenceList, setSentenceList] = useState<Sentence[]>([])
  const [index, setIndex] = useState(0)
  const [bank, setBank] = useState<Chip[]>([])
  const [assembled, setAssembled] = useState<Chip[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [done, setDone] = useState(false)
  const [dragOver, setDragOver] = useState<{ area: 'assembled' | 'bank'; pos: number } | null>(null)

  useEffect(() => {
    if (sourceSentences.length > 0) {
      setSentenceList(sourceSentences)
      setIndex(0)
      setDone(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceSentences.length])

  const dragSrc = useRef<{ area: 'assembled' | 'bank'; idx: number } | null>(null)
  const sentence = sentenceList[index]

  useEffect(() => {
    if (sentence) {
      setBank(shuffle(makeChips(tokenize(sentence.original))))
      setAssembled([])
      setChecked(false)
      setCorrect(false)
      setDragOver(null)
    }
  }, [index, sentence])

  // ── tap handlers (existing behaviour) ──────────────────────────
  function tapBank(i: number) {
    if (checked) return
    const chip = bank[i]
    setBank(b => b.filter((_, idx) => idx !== i))
    setAssembled(a => [...a, chip])
  }

  function tapAssembled(i: number) {
    if (checked) return
    const chip = assembled[i]
    setAssembled(a => a.filter((_, idx) => idx !== i))
    setBank(b => [...b, chip])
  }

  // ── drag handlers ───────────────────────────────────────────────
  function onDragStart(area: 'assembled' | 'bank', idx: number) {
    dragSrc.current = { area, idx }
  }

  function onDragOverAssembled(e: React.DragEvent, pos: number) {
    e.preventDefault()
    setDragOver({ area: 'assembled', pos })
  }

  function onDragOverBank(e: React.DragEvent) {
    e.preventDefault()
    setDragOver({ area: 'bank', pos: 0 })
  }

  function onDropAssembled(insertAt: number) {
    const src = dragSrc.current
    dragSrc.current = null
    setDragOver(null)
    if (!src) return

    if (src.area === 'assembled') {
      // Reorder within assembled
      setAssembled(a => {
        const next = [...a]
        const [chip] = next.splice(src.idx, 1)
        const dest = src.idx < insertAt ? insertAt - 1 : insertAt
        next.splice(dest, 0, chip)
        return next
      })
    } else {
      // Move from bank to assembled
      const chip = bank[src.idx]
      setBank(b => b.filter((_, i) => i !== src.idx))
      setAssembled(a => {
        const next = [...a]
        next.splice(insertAt, 0, chip)
        return next
      })
    }
  }

  function onDropBank() {
    const src = dragSrc.current
    dragSrc.current = null
    setDragOver(null)
    if (!src || src.area === 'bank') return
    const chip = assembled[src.idx]
    setAssembled(a => a.filter((_, i) => i !== src.idx))
    setBank(b => [...b, chip])
  }

  function onDragEnd() {
    dragSrc.current = null
    setDragOver(null)
  }

  // ── check / next ────────────────────────────────────────────────
  function check() {
    if (checked || assembled.length === 0) return
    const ok = checkAssembled(assembled.map(c => c.text), sentence.original)
    setCorrect(ok)
    setChecked(true)
    recordResult(sentence.id, ok)
  }

  function next() {
    if (!correct) {
      // Re-queue the missed sentence at the end
      setSentenceList(list => [...list, list[index]])
      setIndex(i => i + 1)
    } else if (index + 1 >= sentenceList.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if (done) { router.back(); return }
      if (checked) { next(); return }
      if (assembled.length > 0) check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, checked, assembled, index])

  if (!ready) return <div className="p-8 text-center text-gray-600">Loading…</div>
  if (ready && !sentenceList.length) return <div className="p-8 text-center text-gray-600">No sentences in this lesson</div>

  if (done) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">Lesson complete!</h2>
        <button onClick={() => router.back()} className="px-6 py-3 bg-amber-400 text-white rounded-2xl font-semibold text-lg">Back to lesson</button>
      </div>
    )
  }

  const correctTokens = checked && !correct ? tokenize(sentence.original) : []

  function chipColor(i: number): string {
    if (!checked) return 'bg-amber-400'
    if (correct) return 'bg-green-500'
    const expected = correctTokens[i]
    return expected && normalize(assembled[i].text) === normalize(expected) ? 'bg-amber-400' : 'bg-red-400'
  }

  const resultBorder = !checked ? 'border-gray-200 bg-gray-50'
    : correct ? 'border-green-400 bg-green-50'
    : 'border-red-400 bg-red-50'

  const isOverAssembled = dragOver?.area === 'assembled'
  const isOverBank = dragOver?.area === 'bank'

  return (
    <ExerciseShell title="Word bank" backHref={`/lesson/${unit}/${lesson}`} current={index} total={sentenceList.length}>
      <div className="flex-1 flex flex-col gap-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">English</p>
          <p className="text-lg font-medium text-gray-900">{sentence.translation}</p>
        </div>

        {/* Assembly area */}
        <div
          onDragOver={e => { e.preventDefault(); if (!dragOver || dragOver.area !== 'assembled') setDragOver({ area: 'assembled', pos: assembled.length }) }}
          onDrop={() => onDropAssembled(assembled.length)}
          onDragLeave={() => setDragOver(null)}
          className={`min-h-[72px] rounded-2xl border-2 p-3 flex flex-wrap gap-2 transition-colors
            ${resultBorder} ${isOverAssembled ? 'border-amber-400' : ''}`}
        >
          {assembled.length === 0 && !checked && (
            <span className="text-gray-400 text-sm self-center">Tap or drag words here…</span>
          )}
          {assembled.map((chip, i) => (
            <div key={chip.id} className="flex items-center">
              {/* Drop zone before each chip */}
              <div
                onDragOver={e => onDragOverAssembled(e, i)}
                onDrop={e => { e.stopPropagation(); onDropAssembled(i) }}
                className={`w-1 h-8 rounded-full transition-all ${dragOver?.area === 'assembled' && dragOver.pos === i ? 'bg-amber-400 w-1.5' : ''}`}
              />
              <button
                draggable={!checked}
                onDragStart={() => onDragStart('assembled', i)}
                onDragEnd={onDragEnd}
                onClick={() => tapAssembled(i)}
                disabled={checked}
                className={`px-3 py-1.5 rounded-xl text-white font-medium text-base shadow-sm active:scale-95 disabled:opacity-70 cursor-grab active:cursor-grabbing select-none ${chipColor(i)}`}
              >
                {chip.text}
              </button>
            </div>
          ))}
          {/* Trailing drop zone so reorder to end works */}
          <div
            onDragOver={e => onDragOverAssembled(e, assembled.length)}
            onDrop={e => { e.stopPropagation(); onDropAssembled(assembled.length) }}
            className={`w-4 self-stretch ${dragOver?.area === 'assembled' && dragOver.pos === assembled.length ? 'bg-amber-100 rounded' : ''}`}
          />
        </div>

        {checked && (
          <div className="flex items-center gap-2">
            {correct
              ? <span className="text-sm font-semibold text-green-700">✓ Correct!</span>
              : <span className="text-sm text-red-700">Correct: <span className="font-semibold text-gray-800">{sentence.original}</span></span>
            }
            <AudioButton src={`/audio/${sentence.soundFile}`} size="sm" />
          </div>
        )}

        {/* Word bank */}
        <div
          onDragOver={onDragOverBank}
          onDrop={onDropBank}
          onDragLeave={() => setDragOver(null)}
          className={`flex flex-wrap gap-2 min-h-[44px] rounded-2xl p-1 transition-colors ${isOverBank ? 'bg-amber-50' : ''}`}
        >
          {bank.map((chip, i) => (
            <button
              key={chip.id}
              draggable={!checked}
              onDragStart={() => onDragStart('bank', i)}
              onDragEnd={onDragEnd}
              onClick={() => tapBank(i)}
              disabled={checked}
              className="px-3 py-1.5 rounded-xl bg-white border-2 border-gray-200 text-gray-800 font-medium text-base active:scale-95 hover:border-amber-300 disabled:opacity-40 cursor-grab active:cursor-grabbing select-none"
            >
              {chip.text}
            </button>
          ))}
        </div>

        {!checked ? (
          <button onClick={check} disabled={assembled.length === 0}
            className="w-full py-4 bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-semibold text-lg mt-auto">
            Check
          </button>
        ) : (
          <button onClick={next} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-semibold text-lg mt-auto">
            Next
          </button>
        )}
      </div>
    </ExerciseShell>
  )
}
