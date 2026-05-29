'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { initFromRaw, isInitialized } from './data'

const DATA_KEY = 'kurcaf_data'
export const DATA_URL_KEY = 'kurcaf_data_url'
export const DATA_API_KEY = 'kurcaf_api_key'

interface DataContextValue {
  ready: boolean
  loading: boolean
  error: string | null
  dataUrl: string
  apiKey: string
  setDataUrl: (url: string) => void
  fetchFromUrl: (url: string, apiKey?: string) => Promise<void>
  loadFromFile: (file: File) => Promise<void>
  clearData: () => void
}

const DataContext = createContext<DataContextValue>({
  ready: false,
  loading: false,
  error: null,
  dataUrl: '',
  apiKey: '',
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
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(DATA_KEY)
    const url = localStorage.getItem(DATA_URL_KEY) ?? ''
    const key = localStorage.getItem(DATA_API_KEY) ?? ''
    setDataUrl(url)
    setApiKey(key)
    if (stored) {
      try {
        initFromRaw(JSON.parse(stored))
        setReady(true)
        return
      } catch {
        localStorage.removeItem(DATA_KEY)
      }
    }
    const base = process.env.NODE_ENV === 'production' ? '/kurcaf' : ''
    fetch(`${base}/data/lv_Latvian.json`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(raw => { initFromRaw(raw); setReady(true) })
      .catch(() => {})
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

  const fetchFromUrl = useCallback(async (url: string, key?: string) => {
    setLoading(true)
    setError(null)
    try {
      const headers: Record<string, string> = {}
      if (key) headers['X-API-Key'] = key
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      persist(raw, url)
      setDataUrl(url)
      if (key !== undefined) {
        if (key) localStorage.setItem(DATA_API_KEY, key)
        else localStorage.removeItem(DATA_API_KEY)
        setApiKey(key)
      }
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
    localStorage.removeItem(DATA_API_KEY)
    setReady(false)
    setDataUrl('')
    setApiKey('')
    setError(null)
  }, [])

  return (
    <DataContext.Provider value={{ ready, loading, error, dataUrl, apiKey, setDataUrl, fetchFromUrl, loadFromFile, clearData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
