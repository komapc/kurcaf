const TARGET = 'https://api.pakala.vip/v1/ling/phrases/lv'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'X-API-Key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    const apiKey = request.headers.get('X-API-Key') ?? ''
    const res = await fetch(TARGET, {
      headers: apiKey ? { 'X-API-Key': apiKey } : {},
    })

    const body = await res.arrayBuffer()
    return new Response(body, {
      status: res.status,
      headers: {
        ...CORS,
        'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  },
}
