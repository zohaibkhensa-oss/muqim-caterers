// Menu OCR via Groq vision model.
// The Groq key lives in Supabase `settings` (authenticated-only) so it never
// ships in the frontend bundle. VITE_GROQ_API_KEY works as a local dev override.

import { supabase, supabaseReady } from '@/lib/supabase'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct'

let cached

// OCR needs Supabase (for the server-side key) unless a dev env key is set.
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

// Match a scanned line to the catalogue: exact → high, substring → medium, none → low
function matchDish(raw, catalog) {
  const n = norm(raw)
  const exact = catalog.find((d) => norm(d.dish) === n)
  if (exact) return { dish: exact.dish, confidence: 'high' }
  const partial = catalog.find((d) => n && (norm(d.dish).includes(n) || n.includes(norm(d.dish))))
  if (partial) return { dish: partial.dish, confidence: 'medium' }
  return { dish: null, confidence: 'low' }
}

/**
 * Scan a menu image with Groq vision → review rows [{raw, dish, confidence}].
 * Returns null if OCR unavailable or the file isn't an image (caller falls back).
 */
export async function scanMenuImage(file, catalog) {
  if (!file.type.startsWith('image/')) return null
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
    // model's clean name usually beats raw-line matching; retry with raw if needed
    if (!m.dish) { const m2 = matchDish(raw, catalog); return { raw, dish: m2.dish, confidence: m2.confidence } }
    return { raw, dish: m.dish, confidence: m.confidence }
  })
}
