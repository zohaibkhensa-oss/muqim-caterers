import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabaseReady } from '@/lib/supabase'
import { auth } from '@/lib/db'
import { Loader2 } from 'lucide-react'

const input = 'w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-teal-400'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await auth.signIn(form.email, form.password)
    setBusy(false)
    if (error) setError(error.message)
    else navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-teal-950 grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.jpeg" alt="Muqim Caterer's" className="h-16 mx-auto rounded-xl bg-white object-contain mb-4" />
          <h1 className="font-display text-2xl font-semibold text-cream-50">Staff sign in</h1>
          <p className="text-sm text-cream-300/70 mt-1">Muqim Caterers management</p>
        </div>

        {supabaseReady ? (
          <form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-4">
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={input} />
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className={input} />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-teal-700 text-cream-50 py-3 text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {busy && <Loader2 size={15} className="animate-spin" />} Sign in
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-sm text-stone-600 mb-2 font-semibold">Demo mode — no Supabase configured</p>
            <p className="text-xs text-stone-400 mb-5">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to enable real login and the live database.
            </p>
            <Link to="/admin" className="inline-block rounded-xl bg-teal-700 text-cream-50 px-6 py-3 text-sm font-semibold hover:bg-teal-600">
              Continue to admin →
            </Link>
          </div>
        )}

        <p className="text-center mt-6">
          <Link to="/" className="text-xs text-cream-300/60 hover:text-cream-50">← Back to site</Link>
        </p>
      </div>
    </div>
  )
}
