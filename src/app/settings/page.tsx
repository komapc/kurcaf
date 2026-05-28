'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/lib/DataContext'

export default function SettingsPage() {
  const router = useRouter()
  const { ready, loading, error, dataUrl, fetchFromUrl, loadFromFile, clearData } = useData()
  const [urlInput, setUrlInput] = useState(dataUrl)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFetch() {
    if (!urlInput.trim()) return
    await fetchFromUrl(urlInput.trim())
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await loadFromFile(file)
  }

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-2xl text-gray-400 hover:text-gray-600">‹</button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Status */}
      <div className={`rounded-2xl p-4 mb-6 ${ready ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
        <p className="text-sm font-medium">
          {ready ? '✓ Course data loaded' : '⚠ No course data — choose a source below'}
        </p>
        {ready && dataUrl && (
          <p className="text-xs text-gray-500 mt-1 truncate">Source: {dataUrl}</p>
        )}
        {ready && !dataUrl && (
          <p className="text-xs text-gray-500 mt-1">Source: local file</p>
        )}
      </div>

      {/* Option 1 — remote URL */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-1">Load from URL</h2>
        <p className="text-xs text-gray-400 mb-4">JSON will be fetched and saved to device storage.</p>
        <input
          type="url"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="https://example.com/lv_Latvian.json"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none text-sm mb-3"
        />
        <button
          onClick={handleFetch}
          disabled={loading || !urlInput.trim()}
          className="w-full py-3 rounded-xl bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm"
        >
          {loading ? 'Fetching…' : 'Fetch & save'}
        </button>
      </section>

      {/* Option 2 — local file */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-1">Upload local file</h2>
        <p className="text-xs text-gray-400 mb-4">Pick <code className="bg-gray-100 px-1 rounded">lv_Latvian.json</code> from your device.</p>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Choose file…'}
        </button>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Success → go home */}
      {ready && (
        <button
          onClick={() => router.push('/')}
          className="w-full py-4 rounded-2xl bg-green-400 text-white font-semibold text-lg"
        >
          Go to units →
        </button>
      )}

      {/* Clear data */}
      {ready && (
        <button
          onClick={clearData}
          className="w-full mt-3 py-3 rounded-2xl text-red-400 text-sm font-medium hover:bg-red-50"
        >
          Clear saved data
        </button>
      )}
    </div>
  )
}
