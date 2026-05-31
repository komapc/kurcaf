'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/lib/DataContext'

function buildUrl(host: string, lang: string) {
  const h = host.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
  const l = lang.trim()
  return h && l ? `https://${h}/v1/ling/phrases/${l}` : ''
}

function parseUrl(url: string): { host: string; lang: string } {
  try {
    const u = new URL(url)
    const lang = u.pathname.split('/').pop() ?? ''
    return { host: u.host, lang }
  } catch {
    return { host: '', lang: '' }
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { ready, loading, error, dataUrl, apiKey, fetchFromUrl, loadFromFile, clearData } = useData()

  const parsed = parseUrl(dataUrl)
  const [host, setHost] = useState(parsed.host)
  const [lang, setLang] = useState(parsed.lang)
  const [keyInput, setKeyInput] = useState(apiKey)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const { host, lang } = parseUrl(dataUrl)
    if (host) setHost(host)
    if (lang) setLang(lang)
  }, [dataUrl])

  useEffect(() => { setKeyInput(apiKey) }, [apiKey])

  async function handleFetch() {
    const url = buildUrl(host, lang)
    if (!url) return
    await fetchFromUrl(url, keyInput.trim())
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await loadFromFile(file)
  }

  const url = buildUrl(host, lang)

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-2xl text-gray-500 hover:text-gray-800">‹</button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Status */}
      <div className={`rounded-2xl p-4 mb-6 ${ready ? 'bg-green-50 border border-green-300' : 'bg-amber-50 border border-amber-300'}`}>
        <p className={`text-sm font-semibold ${ready ? 'text-green-800' : 'text-amber-800'}`}>
          {ready ? '✓ Course data loaded' : '⚠ No course data — choose a source below'}
        </p>
        {ready && dataUrl && (
          <p className="text-xs text-gray-600 mt-1 truncate">Source: {dataUrl}</p>
        )}
        {ready && !dataUrl && (
          <p className="text-xs text-gray-600 mt-1">Source: local file</p>
        )}
      </div>

      {/* Option 1 — remote URL */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-1">Load from server</h2>
        <p className="text-sm text-gray-500 mb-4">Fetches JSON and saves it to this device. Works offline after first load.</p>

        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Host</label>
        <input
          type="text"
          value={host}
          onChange={e => setHost(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="example.com"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none text-sm mt-1 mb-3 text-gray-800"
        />

        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Language code</label>
        <input
          type="text"
          value={lang}
          onChange={e => setLang(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="lv"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none text-sm mt-1 mb-3 text-gray-800"
        />

        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">API key</label>
        <input
          type="password"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="(if required)"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none text-sm mt-1 mb-3 text-gray-800"
        />

        {url && <p className="text-xs text-gray-400 mb-3 break-all">{url}</p>}

        <button
          onClick={handleFetch}
          disabled={loading || !url}
          className="w-full py-3 rounded-xl bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm"
        >
          {loading ? 'Fetching…' : 'Fetch & save'}
        </button>
      </section>

      {/* Option 2 — local file */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-1">Upload local file</h2>
        <p className="text-sm text-gray-500 mb-4">Pick <code className="bg-gray-100 px-1 rounded text-gray-700">lv_Latvian.json</code> from your device.</p>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Choose file…'}
        </button>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-red-700">Error: {error}</p>
        </div>
      )}

      {ready && (
        <button onClick={() => router.push('/')} className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-lg">
          Go to units →
        </button>
      )}
      {ready && (
        <button onClick={clearData} className="w-full mt-3 py-3 rounded-2xl text-red-500 text-sm font-semibold hover:bg-red-50">
          Clear saved data
        </button>
      )}
    </div>
  )
}
