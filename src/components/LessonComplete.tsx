'use client'

interface Props {
  onBack: () => void
  emoji?: string
  title?: string
  label?: string
}

/** Shared "Lesson complete!" celebration screen shown at the end of an exercise. */
export default function LessonComplete({ onBack, emoji = '🎉', title = 'Lesson complete!', label = 'Back to lesson' }: Props) {
  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-5xl">{emoji}</div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <button onClick={onBack} className="px-6 py-3 bg-amber-400 text-white rounded-2xl font-semibold text-lg">
        {label}
      </button>
    </div>
  )
}
