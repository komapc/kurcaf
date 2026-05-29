#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/lv_Latvian.json')

let apiKey = process.env.API_KEY ?? ''
if (!apiKey) {
  if (!process.stdin.isTTY) {
    console.error('Error: API_KEY env var is not set. Add it as a GitHub secret.')
    process.exit(1)
  }
  const rl = createInterface({ input: process.stdin, output: process.stderr })
  apiKey = await new Promise(res => rl.question('API key: ', res))
  rl.close()
}

const response = await fetch('https://api.pakala.vip/v1/ling/phrases/lv', {
  headers: { 'X-API-Key': apiKey.trim() },
})

if (!response.ok) throw new Error(`HTTP ${response.status}`)

const json = await response.json()
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(json))
console.log(`Saved ${OUT} (${(JSON.stringify(json).length / 1024).toFixed(0)} KB)`)
