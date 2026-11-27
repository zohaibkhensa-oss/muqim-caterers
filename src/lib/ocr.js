// Menu OCR/extraction.
// - PDFs: real text-layer extraction via pdf.js (no AI needed) — ignores
//   presentation text, keeps dish-looking lines, fuzzy-matches to catalogue.
// - Images: Groq vision model (key lives in Supabase `settings`, staff-only).
// - VITE_GROQ_API_KEY works as a local dev override.

import { supabase, supabaseReady } from '@/lib/supabase'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct'

let cached
export const ocrEnabled = Boolean(import.meta.env.VITE_GROQ_API_KEY) || supabaseReady

async function ocrConfig() {
  if (cached) return cached
  cached = { key: import.meta.env.VITE_GROQ_API_KEY, model: DEFAULT_MODEL }
  if (!cached.key && supabaseReady) {
    const { data } = await supabase
      .from('settings').select('key, value').in('key', ['groq_api_key', 'groq_model'])
    const rows = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
    cached = { key: rows.groq_api_key, model: rows.groq_model || DEFAULT_MODEL }
  }
  return cached
}

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

// ── fuzzy matching: partial names & similar wording (e.g. korma ≈ qourma) ───

const lev = (a, b) => {
  const m = a.length, n = b.length
  if (!m) return n
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
  return dp[m][n]
}

const wordSet = (s) => new Set(norm(s).split(' ').filter((w) => w.length > 2))
const overlap = (a, b) => {
  const A = wordSet(a), B = wordSet(b)
  if (!A.size || !B.size) return 0
  let hit = 0
  A.forEach((w) => { if (B.has(w)) hit++ })
  return hit / Math.max(A.size, B.size)
}

// exact → high · substring/fuzzy → medium · none → low (unmatched)
function matchDish(raw, catalog) {
  const n = norm(raw)
  if (!n) return { dish: null, confidence: 'low' }
  const exact = catalog.find((d) => norm(d.dish) === n)
  if (exact) return { dish: exact.dish, confidence: 'high' }
  const partial = catalog.find((d) => norm(d.dish).includes(n) || n.includes(norm(d.dish)))
  if (partial) return { dish: partial.dish, confidence: 'medium' }
  const fuzzy = catalog.find((d) =>
    overlap(raw, d.dish) >= 0.5 || lev(norm(raw), norm(d.dish)) <= Math.max(3, norm(d.dish).length * 0.35))
  if (fuzzy) return { dish: fuzzy.dish, confidence: 'medium' }
  return { dish: null, confidence: 'low' }
}

// ── PDF text-layer extraction (ignores presentation/decoration text) ────────

// drop lines that are clearly headings, boilerplate or packaging text
const NOISE = /^(menu|quotation|estimate|dear|respected|sir|madam|thank|regards|note|terms|condition|page|date|total|subtotal|gst|tax|address|phone|mobile|email|www|http|catering|package|event|venue|guest|pax|served by|prepared|signature|muqim|muqeem|caters|caterer's|hazratganj|lucknow)\b/i
const isDishLine = (s) => {
  const t = s.trim()
  if (t.length < 4 || t.length > 60) return false
  if (NOISE.test(t)) return false
  if (/^\d+[\s.):-]/.test(t) && !/[a-zA-Z]{4,}/.test(t)) return false // pure numbering
  if (/\d{5,}|@|\.com|rs\.|inr|₹/.test(t)) return false
  return /[a-zA-Z]{4,}/.test(t) // needs real words
}

async function extractPdfLines(file) {
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const lines = []
  for (let p = 1; p <= doc.numPages; p++) {
    const { items } = await (await doc.getPage(p)).getTextContent()
    const rows = new Map()
    for (const it of items) {
      if (!it.str.trim()) continue
      const y = Math.round(it.transform[5])
      const row = [...rows.keys()].find((k) => Math.abs(k - y) < 3) ?? y
      rows.set(row, [...(rows.get(row) ?? []), { x: it.transform[4], str: it.str }])
    }
    ;[...rows.keys()].sort((a, b) => b - a).forEach((y) => {
      const line = rows.get(y).sort((a, b) => a.x - b.x).map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim()
      if (isDishLine(line)) lines.push(line)
    })
  }
  return lines
}

async function scanPdf(file, catalog) {
  const lines = await extractPdfLines(file)
  if (!lines.length) return null
  const seen = new Set()
  return lines
    .map((raw) => {
      const m = matchDish(raw, catalog)
      return { raw, dish: m.dish, confidence: m.dish ? m.confidence : 'low' }
    })
    .filter((r) => {
      const k = r.dish ?? r.raw
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
}

// ── Groq vision for photos of handwritten/printed menus ─────────────────────

async function scanImage(file, catalog) {
  const { key, model } = await ocrConfig()
  if (!key) return null

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      max_completion_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'This is a catering event menu (possibly handwritten, English/Urdu-English mix). ' +
                'List every dish or food/drink item you can read. ' +
                'Return JSON only: {"items":[{"raw":"<line as written>","dish":"<clean english dish name>"}]}. ' +
                'Skip headings, dates, phone numbers and notes.',
            },
            { type: 'image_url', image_url: { url: await fileToDataURL(file) } },
          ],
        },
      ],
    }),
  })

  if (!res.ok) return null
  const { choices } = await res.json()
  let items
  try {
    items = JSON.parse(choices?.[0]?.message?.content ?? '{}').items
  } catch {
    return null
  }
  if (!Array.isArray(items) || !items.length) return null

  return items.map((it) => {
    const raw = String(it.raw ?? it.dish ?? '')
    const guess = String(it.dish ?? it.raw ?? '')
    const m = matchDish(guess, catalog)
    if (!m.dish) { const m2 = matchDish(raw, catalog); return { raw, dish: m2.dish, confidence: m2.confidence } }
    return { raw, dish: m.dish, confidence: m.confidence }
  })
}

/**
 * Scan a menu file → review rows [{raw, dish, confidence}].
 * PDF → text-layer extraction · image → Groq vision · else/null → caller falls back.
 */
export async function scanMenuFile(file, catalog) {
  try {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return await scanPdf(file, catalog)
    }
    if (file.type.startsWith('image/')) return await scanImage(file, catalog)
  } catch (e) {
    console.warn('menu scan failed:', e)
  }
  return null
}

export const scanMenuImage = scanMenuFile // back-compat
