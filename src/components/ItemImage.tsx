'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  className?: string
}

export default function ItemImage({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center rounded-xl ${className}`}>
        <span className="text-4xl">🖼️</span>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setFailed(true)}
        sizes="(max-width: 480px) 100vw, 480px"
      />
    </div>
  )
}
