import type { NextConfig } from 'next'
import fs from 'fs'
import path from 'path'

// Copy src/data/lv_Latvian.json → public/data/ at build/dev time if present
const src = path.resolve('./src/data/lv_Latvian.json')
const dest = path.resolve('./public/data/lv_Latvian.json')
if (fs.existsSync(src)) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/kurcaf' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
