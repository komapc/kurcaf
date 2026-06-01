'use client'

import { useEffect } from 'react'

/**
 * Run `handler` whenever the Enter key is pressed.
 * Pass the same `deps` you would to useEffect so the handler closes over fresh state.
 */
export function useEnterKey(handler: () => void, deps: React.DependencyList) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') handler()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
