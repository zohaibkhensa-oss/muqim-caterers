import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus, X, Trash2, Search, Upload, ScanLine, CheckCircle2,
  Send, PackageCheck, ChefHat, ClipboardList, RefreshCw,
} from 'lucide-react'
import { LOGISTICS_CHECKLIST } from '@/data/mock'
import {
  PREP_GROUPS, prepGroupById, groupForSection, ALL_DISHES,
  generateProcurement, waLink, procurementMessage, MOCK_OCR_RESULT,
} from '@/lib/procurement'
import { scanMenuImage, ocrEnabled } from '@/lib/ocr'
import {
  addMenuItem, removeMenuItem, setMenuItemGroup,
  setProcurement, setProcurementVendor, setProcurementStatus, toggleLogisticItem,
} from '@/features/bookings/bookingsSlice'

const card = 'bg-white rounded-xl border border-stone-200 p-5'
const input = 'rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400 bg-white'

// ─── Dish picker modal ───────────────────────────────────────────────────────

function DishPicker({ booking, onClose }) {
  const dispatch = useDispatch()
  const [q, setQ] = useState('')
  const existing = new Set((booking.menuItems ?? []).map((m) => m.dish))
  const visible = ALL_DISHES.filter((d) => !existing.has(d.dish) && (!q || d.dish.toLowerCase().includes(q.toLowerCase())))
  const sections = useMemo(() => {
    const map = new Map()
    visible.forEach((d) => {
      if (!map.has(d.section)) map.set(d.section, [])
      map.get(d.section).push(d)
    })
    return [...map.entries()]
  }, [q])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-display text-lg font-semibold text-teal-900">Add dishes to menu</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100"><X size={18} /></button>
        </header>
        <div className="px-5 py-3 border-b border-stone-100 relative">
          <Search size={15} className="absolute left-8 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" className="w-full rounded-lg border border-stone-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-teal-400" />
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {sections.map(([section, dishes]) => (
            <div key={section}>
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">{section}</p>
              <div className="flex flex-wrap gap-2">
                {dishes.map((d) => (
                  <button
                    key={d.dish}
                    onClick={() => dispatch(addMenuItem({ id: booking.id, dish: d.dish, group: d.group }))}
                    className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    + {d.dish}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!sections.length && <p className="text-sm text-stone-400 text-center py-8">No matching dishes.</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Menu import (simulated OCR) ─────────────────────────────────────────────

function MenuImport({ booking, onClose }) {
  const dispatch = useDispatch()
  const [phase, setPhase] = useState('pick') // pick | scanning | review
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState([])

  const startScan = async (file) => {
    setFileName(file.name)
    setPhase('scanning')
    try {
      const scanned = await scanMenuImage(file, ALL_DISHES)
      setRows(scanned?.length ? scanned : MOCK_OCR_RESULT.map((r) => ({ ...r })))
    } catch {
      setRows(MOCK_OCR_RESULT.map((r) => ({ ...r })))
    }
    setPhase('review')
  }

  const save = () => {
    rows.forEach((r) => {
      if (!r.dish) return
      const found = ALL_DISHES.find((d) => d.dish === r.dish)
      dispatch(addMenuItem({ id: booking.id, dish: r.dish, group: found?.group ?? 'vegChef' }))
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-display text-lg font-semibold text-teal-900">Import menu (photo / PDF)</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100"><X size={18} /></button>
        </header>

        {phase === 'pick' && (
          <div className="p-8">
            <label className="block border-2 border-dashed border-stone-300 rounded-2xl p-10 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition-colors">
              <Upload size={28} className="mx-auto text-stone-400 mb-3" />
              <p className="text-sm font-medium text-stone-700">Drop a handwritten menu photo or PDF</p>
              <p className="text-xs text-stone-400 mt-1">{ocrEnabled ? 'AI scan via Groq — images only for now' : 'Demo mode — add VITE_GROQ_API_KEY for live OCR'} · review &amp; match before saving</p>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files[0] && startScan(e.target.files[0])} />
            </label>
          </div>
        )}

        {phase === 'scanning' && (
          <div className="p-16 text-center">
            <ScanLine size={36} className="mx-auto text-teal-600 animate-pulse mb-4" />
            <p className="font-medium text-stone-700">Reading {fileName}…</p>
            <p className="text-xs text-stone-400 mt-1">Extracting dishes and matching to the Muqim catalogue</p>
          </div>
        )}

        {phase === 'review' && (
          <>
            <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800">
              Review every line — items flagged <strong>needs review</strong> aren't auto-approved. Pick the right catalogue match or leave blank to skip.
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-2.5">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    r.confidence === 'high' ? 'bg-teal-100 text-teal-700'
                    : r.confidence === 'medium' ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-600'
                  }`}>
                    {r.confidence === 'low' ? 'needs review' : r.confidence}
                  </span>
                  <span className="text-sm text-stone-500 w-44 truncate" title={r.raw}>{r.raw}</span>
                  <span className="text-stone-300">→</span>
                  <select
                    value={r.dish ?? ''}
                    onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, dish: e.target.value || null } : x))}
                    className={`${input} flex-1`}
                  >
                    <option value="">— skip this item —</option>
                    {ALL_DISHES.map((d) => <option key={d.dish} value={d.dish}>{d.dish}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <footer className="px-5 py-4 border-t border-stone-100 flex justify-end gap-3">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-500 hover:text-stone-700">Cancel</button>
              <button onClick={save} className="rounded-lg bg-teal-700 text-cream-50 px-5 py-2 text-sm font-semibold hover:bg-teal-600">
                Save {rows.filter((r) => r.dish).length} dishes to event menu
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function EventMenu({ booking }) {
  const dispatch = useDispatch()
  const [picker, setPicker] = useState(false)
  const [importer, setImporter] = useState(false)
  const menu = booking.menuItems ?? []

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-teal-900 flex items-center gap-2">
          <ChefHat size={17} /> Event menu — segregated by prep group
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setImporter(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-teal-400">
            <Upload size={13} /> Import menu
          </button>
          <button onClick={() => setPicker(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 text-cream-50 px-3 py-1.5 text-xs font-semibold hover:bg-teal-600">
            <Plus size={13} /> Add dishes
          </button>
        </div>
      </div>

      {!menu.length && (
        <p className="text-sm text-stone-400 py-6 text-center">
          No dishes selected yet — pick from the catalogue or import the customer's handwritten menu.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {PREP_GROUPS.map((g) => {
          const items = menu.filter((m) => m.group === g.id)
          if (!items.length) return null
          return (
            <div key={g.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-800 mb-1">{g.label}</p>
              <p className="text-[11px] text-stone-400 mb-3">{g.desc}</p>
              <ul className="space-y-2">
                {items.map((m) => (
                  <li key={m.dish} className="flex items-center gap-2 text-sm">
                    <select
                      value={m.group}
                      onChange={(e) => dispatch(setMenuItemGroup({ id: booking.id, dish: m.dish, group: e.target.value }))}
                      className={`${input} w-36 shrink-0`}
                      title="Prep group"
                    >
                      {PREP_GROUPS.map((pg) => <option key={pg.id} value={pg.id}>{pg.label}</option>)}
                    </select>
                    <span className="flex-1 min-w-0 truncate text-stone-700">{m.dish}</span>
                    <button onClick={() => dispatch(removeMenuItem({ id: booking.id, dish: m.dish }))} className="text-stone-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {picker && <DishPicker booking={booking} onClose={() => setPicker(false)} />}
      {importer && <MenuImport booking={booking} onClose={() => setImporter(false)} />}
    </section>
  )
}

const PROC_STATUS = {
  pending: { label: 'Pending', cls: 'bg-stone-100 text-stone-500' },
  sent: { label: 'Sent on WhatsApp', cls: 'bg-sky-100 text-sky-700' },
  confirmed: { label: 'Confirmed', cls: 'bg-teal-100 text-teal-700' },
}

function Procurement({ booking }) {
  const dispatch = useDispatch()
  const vendors = useSelector((s) => s.vendors.list)
  const lists = booking.procurement

  const generate = () => {
    const groups = generateProcurement(booking).map((g) => ({
      ...g,
      vendorId: vendors.find((v) => v.category === g.category)?.id ?? '',
      status: 'pending',
    }))
    dispatch(setProcurement({ id: booking.id, groups }))
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-teal-900 flex items-center gap-2">
          <ClipboardList size={17} /> Procurement lists
        </h3>
        <button
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 text-cream-50 px-3 py-1.5 text-xs font-semibold hover:bg-teal-600"
        >
          <RefreshCw size={13} /> {lists ? 'Regenerate from menu + PAX' : 'Generate from menu + PAX'}
        </button>
      </div>

      {!lists ? (
        <p className="text-sm text-stone-400 py-6 text-center">
          Generates separate supplier lists from the menu & guest counts —
          vegetables are split into three packs (veg chef, non-veg chef, salad) as per your process.
        </p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {lists.map((g) => {
            const vendor = vendors.find((v) => v.id === g.vendorId)
            const status = PROC_STATUS[g.status] ?? PROC_STATUS.pending
            return (
              <div key={g.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-stone-800">{g.label}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.cls}`}>{status.label}</span>
                </div>
                <ul className="space-y-1 text-sm text-stone-600 mb-4">
                  {g.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between gap-3">
                      <span className="min-w-0 truncate">• {i.label}</span>
                      <span className="text-stone-400 shrink-0 text-xs">{i.qty}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center gap-2">
                  <select
                    value={g.vendorId}
                    onChange={(e) => dispatch(setProcurementVendor({ id: booking.id, groupId: g.id, vendorId: e.target.value }))}
                    className={`${input} flex-1 min-w-0`}
                  >
                    <option value="">— assign vendor —</option>
                    {vendors.filter((v) => v.category === g.category).map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                    {vendors.filter((v) => v.category !== g.category).map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                    ))}
                  </select>
                  {vendor && g.status !== 'confirmed' && (
                    <a
                      href={waLink(vendor.phone, procurementMessage(booking, g))}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => dispatch(setProcurementStatus({ id: booking.id, groupId: g.id, status: 'sent' }))}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white px-3 py-1.5 text-xs font-bold hover:brightness-95 shrink-0"
                    >
                      <Send size={12} /> WhatsApp
                    </a>
                  )}
                  {g.status === 'sent' && (
                    <button
                      onClick={() => dispatch(setProcurementStatus({ id: booking.id, groupId: g.id, status: 'confirmed' }))}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 text-cream-50 px-3 py-1.5 text-xs font-bold hover:bg-teal-600 shrink-0"
                    >
                      <PackageCheck size={12} /> Confirm
                    </button>
                  )}
                  {g.status === 'confirmed' && (
                    <span className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold shrink-0">
                      <CheckCircle2 size={14} /> Confirmed
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function Logistics({ booking }) {
  const dispatch = useDispatch()
  const done = new Set(booking.logistics ?? [])
  const total = Object.values(LOGISTICS_CHECKLIST).flat().length
  const doneCount = done.size

  return (
    <section className={card}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-teal-900 flex items-center gap-2">
          <CheckCircle2 size={17} /> Service & logistics checklist
        </h3>
        <span className="text-xs font-semibold text-stone-500">{doneCount}/{total}</span>
      </div>
      <p className="text-xs text-stone-400 mb-4">Separate from menu prep, tied to this event.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(LOGISTICS_CHECKLIST).map(([category, items]) => (
          <div key={category} className="rounded-xl border border-stone-100 bg-stone-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800 mb-2.5">{category}</p>
            <ul className="space-y-1.5">
              {items.map((item) => {
                const key = `${category}::${item}`
                const checked = done.has(key)
                return (
                  <li key={item}>
                    <button
                      onClick={() => dispatch(toggleLogisticItem({ id: booking.id, key }))}
                      className="flex items-center gap-2.5 text-sm w-full text-left group"
                    >
                      <span className={`w-[18px] h-[18px] rounded-md border grid place-items-center shrink-0 transition-colors ${
                        checked ? 'bg-teal-600 border-teal-600 text-white' : 'border-stone-300 group-hover:border-teal-400'
                      }`}>
                        {checked && <CheckCircle2 size={12} />}
                      </span>
                      <span className={checked ? 'text-stone-400 line-through' : 'text-stone-700'}>{item}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function BookingOperations({ booking }) {
  return (
    <div className="space-y-5">
      <EventMenu booking={booking} />
      <Procurement booking={booking} />
      <Logistics booking={booking} />
    </div>
  )
}
