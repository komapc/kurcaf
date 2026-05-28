'use client'

import { useState, useRef } from 'react'

interface Props {
  src: string
  size?: 'sm' | 'md' | 'lg'
  autoPlay?: boolean
}

export default function AudioButton({ src, size = 'md', autoPlay = false }: Props) {
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  }

  function play() {
    if (error) return
    if (!audioRef.current) {
      const audio = new Audio(src)
      audio.onended = () => setPlaying(false)
      audio.onerror = () => { setError(true); setPlaying(false) }
      audioRef.current = audio
      if (autoPlay) {
        audio.play().then(() => setPlaying(true)).catch(() => setError(true))
        return
      }
    }
    if (playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setError(true))
    }
  }

  return (
    <button
      onClick={e => { e.stopPropagation(); play() }}
      disabled={error}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-colors
        ${error
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : playing
            ? 'bg-amber-500 text-white shadow-lg scale-95'
            : 'bg-amber-400 hover:bg-amber-500 text-white shadow-md active:scale-95'
        }`}
      aria-label="Play audio"
    >
      {playing ? '⏸' : '▶'}
    </button>
  )
}
