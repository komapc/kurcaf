'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { initFromRaw, isInitialized } from './data'

const DATA_KEY = 'kurcaf_data'
export const DATA_URL_KEY = 'kurcaf_data_url'

interface DataContextValue {
  ready: boolean
  loading: boolean
  error: string | null
  dataUrl: string
  setDataUrl: (url: string) => void
  fetchFromUrl: (url: string) => Promise<void>
  loadFromFile: (file: File) => Promise<void>
  clearData: () => void
}

const DataContext = createContext<DataContextValue>({
  ready: false,
  loading: false,
  error: null,
  dataUrl: '',
  setDataUrl: () => {},
  fetchFromUrl: async () => {},
  loadFromFile: async () => {},
  clearData: () => {},
})

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(DATA_KEY)
    const url = localStorage.getItem(DATA_URL_KEY) ?? ''
    setDataUrl(url)
    if (stored) {
      try {
        initFromRaw(JSON.parse(stored))
        setReady(true)
      } catch {
        localStorage.removeItem(DATA_KEY)
      }
    }
  }, [])

  const persist = useCallback((raw: unknown, url?: string) => {
    localStorage.setItem(DATA_KEY, JSON.stringify(raw))
    if (url !== undefined) {
      if (url) localStorage.setItem(DATA_URL_KEY, url)
      else localStorage.removeItem(DATA_URL_KEY)
    }
    initFromRaw(raw)
    setReady(true)
    setError(null)
  }, [])

  const fetchFromUrl = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      persist(raw, url)
      setDataUrl(url)
      localStorage.setItem(DATA_URL_KEY, url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [persist])

  const loadFromFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const text = await file.text()
      const raw = JSON.parse(text)
      persist(raw, '')
      localStorage.removeItem(DATA_URL_KEY)
      setDataUrl('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON file')
    } finally {
      setLoading(false)
    }
  }, [persist])

  const clearData = useCallback(() => {
    localStorage.removeItem(DATA_KEY)
    localStorage.removeItem(DATA_URL_KEY)
    setReady(false)
    setDataUrl('')
    setError(null)
  }, [])

  return (
    <DataContext.Provider value={{ ready, loading, error, dataUrl, setDataUrl, fetchFromUrl, loadFromFile, clearData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
