#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function prompt(question) {
  if (!process.stdin.isTTY) { console.error(`Error: ${question} not set`); process.exit(1) }
  const rl = createInterface({ input: process.stdin, output: process.stderr })
  const answer = await new Promise(res => rl.question(question + ': ', res))
  rl.close()
  return answer.trim()
}

const apiUrl  = process.env.API_URL  || await prompt('API URL (e.g. https://host/v1/ling/phrases/lv)')
const apiKey  = process.env.API_KEY  || await prompt('API key')
const outFile = process.env.OUT_FILE || resolve(__dirname, '../src/data/lv_Latvian.json')

const res = await fetch(apiUrl, { headers: apiKey ? { 'X-API-Key': apiKey } : {} })
if (!res.ok) throw new Error(`HTTP ${res.status}`)

const json = await res.json()
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(json))
console.log(`Saved ${outFile} (${(JSON.stringify(json).length / 1024).toFixed(0)} KB)`)
