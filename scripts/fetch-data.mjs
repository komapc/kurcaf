#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/lv_Latvian.json')

const res = await fetch('https://api.pakala.vip/v1/ling/phrases/lv', {
  headers: { 'X-API-Key': '1234' },
})

if (!res.ok) throw new Error(`HTTP ${res.status}`)

const json = await res.json()
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(json))
console.log(`Saved ${OUT} (${(JSON.stringify(json).length / 1024).toFixed(0)} KB)`)
