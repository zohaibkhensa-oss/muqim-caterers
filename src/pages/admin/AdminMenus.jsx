import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { toggleActive, addPackage } from '@/features/packages/packagesSlice'
import { fmtINR, SERVICES } from '@/data/mock'

const input = 'w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-teal-400'

export default function AdminMenus() {
  const packages = useSelector((s) => s.packages.list)
  const dispatch = useDispatch()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: SERVICES[0], pricePerHead: 500, minGuests: 20, tagline: '' })

  const create = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    dispatch(addPackage({ ...form, pricePerHead: Number(form.pricePerHead), minGuests: Number(form.minGuests), gradient: 'from-teal-700 via-teal-600 to-teal-400', servesNote: '', items: [], tags: [] }))
    setForm({ name: '', category: SERVICES[0], pricePerHead: 500, minGuests: 20, tagline: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-stone-500">{packages.filter((p) => p.active).length} live on storefront</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 text-cream-50 px-4 py-2 text-sm font-semibold hover:bg-teal-600"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />} New package
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-xl border border-stone-200 p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Package name *" className={input} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
            {SERVICES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="number" value={form.pricePerHead} onChange={(e) => setForm({ ...form, pricePerHead: e.target.value })} placeholder="₹ / head" className={input} />
          <input type="number" value={form.minGuests} onChange={(e) => setForm({ ...form, minGuests: e.target.value })} placeholder="Min guests" className={input} />
          <button className="rounded-lg bg-gold-500 text-teal-950 font-bold text-sm hover:bg-gold-400">Create</button>
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="One-line description" className={`${input} sm:col-span-2 lg:col-span-5`} />
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((p) => (
          <div key={p.id} className={`bg-white rounded-xl border border-stone-200 overflow-hidden ${!p.active && 'opacity-60'}`}>
            <div className={`h-20 bg-gradient-to-br ${p.gradient} flex items-end px-4 pb-2`}>
              <span className="text-white font-display font-semibold leading-tight">{p.name}</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-stone-500 mb-2">{p.category} · min {p.minGuests} guests</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-800">{fmtINR(p.pricePerHead)}<span className="text-xs font-normal text-stone-500">/head</span></span>
                <button
                  onClick={() => dispatch(toggleActive(p.id))}
                  className="flex items-center gap-1.5 text-xs font-semibold"
                  title={p.active ? 'Hide from storefront' : 'Show on storefront'}
                >
                  {p.active
                    ? <><ToggleRight size={22} className="text-teal-600" /><span className="text-teal-700">Live</span></>
                    : <><ToggleLeft size={22} className="text-stone-400" /><span className="text-stone-400">Hidden</span></>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
