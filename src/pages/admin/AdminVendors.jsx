import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Phone, Plus, X, Package } from 'lucide-react'
import { VENDOR_CATEGORIES, fmtINR } from '@/data/mock'
import { addVendor } from '@/features/vendors/vendorsSlice'

const input = 'w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-teal-400'

export default function AdminVendors() {
  const vendors = useSelector((s) => s.vendors.list)
  const dispatch = useDispatch()
  const [showForm, setShowForm] = useState(false)
  const [cat, setCat] = useState('All')
  const [form, setForm] = useState({ name: '', phone: '', category: VENDOR_CATEGORIES[0], items: '' })

  const create = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    dispatch(addVendor(form))
    setForm({ name: '', phone: '', category: VENDOR_CATEGORIES[0], items: '' })
    setShowForm(false)
  }

  const filtered = vendors.filter((v) => cat === 'All' || v.category === cat)
  const totalOutstanding = vendors.reduce((s, v) => s + v.balance, 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-sm text-stone-500">
          {vendors.length} vendors · <span className={totalOutstanding ? 'text-amber-700 font-semibold' : ''}>{fmtINR(totalOutstanding)} outstanding</span>
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 text-cream-50 px-4 py-2 text-sm font-semibold hover:bg-teal-600"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />} New vendor
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-xl border border-stone-200 p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vendor name *" className={input} />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={input} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
            {VENDOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="Items supplied" className={input} />
          <button className="rounded-lg bg-gold-500 text-teal-950 font-bold text-sm hover:bg-gold-400">Add</button>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {['All', ...VENDOR_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              cat === c ? 'bg-teal-700 text-cream-50' : 'bg-white border border-stone-200 text-stone-600 hover:border-teal-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div key={v.id} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold">{v.name}</p>
                <span className="inline-block mt-1 rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-[11px] font-semibold">
                  {v.category}
                </span>
              </div>
              <span className={`text-sm font-semibold ${v.balance ? 'text-amber-700' : 'text-teal-700'}`}>
                {v.balance ? `₹${v.balance.toLocaleString('en-IN')} due` : 'Settled'}
              </span>
            </div>
            <p className="flex items-center gap-2 text-sm text-stone-600 mt-3">
              <Phone size={14} className="text-teal-600" /> {v.phone}
            </p>
            {v.items && (
              <p className="flex items-start gap-2 text-sm text-stone-500 mt-2">
                <Package size={14} className="text-stone-400 mt-0.5 shrink-0" /> {v.items}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
