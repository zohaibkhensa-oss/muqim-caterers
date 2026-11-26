import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { format, isPast, isToday } from 'date-fns'
import {
  CheckCircle2, Circle, AlertCircle, ShieldCheck, ListChecks,
  Calculator, FileCheck2, Ban, Plus,
} from 'lucide-react'
import { fmtINR } from '@/data/mock'
import {
  readiness, EXPENSE_CATEGORIES, estimateTotal, actualTotal, actualByCategory, receiptsTotal,
} from '@/lib/tasks'
import {
  setTaskStatus, assignTask, addTask, setEstimate, toggleClosing, moveBooking,
} from '@/features/bookings/bookingsSlice'

const card = 'bg-white rounded-xl border border-stone-200 p-5'
const input = 'rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400 bg-white'

// ─── Readiness tracker ───────────────────────────────────────────────────────

export function Readiness({ booking }) {
  const r = readiness(booking)
  return (
    <section className={card}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-teal-900 flex items-center gap-2"><ShieldCheck size={17} className="text-teal-600" /> Event readiness</h3>
        <span className={`text-sm font-bold ${r.pct === 100 ? 'text-teal-700' : 'text-amber-600'}`}>{r.pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-stone-100 mb-4 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${r.pct === 100 ? 'bg-teal-500' : 'bg-gold-400'}`} style={{ width: `${r.pct}%` }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {r.rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2.5 text-sm">
            {row.ok
              ? <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
              : <AlertCircle size={16} className="text-amber-500 shrink-0" />}
            <span className={row.ok ? 'text-stone-600' : 'text-stone-800 font-medium'}>{row.label}</span>
            <span className="text-[11px] text-stone-400 ml-auto">{row.detail}</span>
          </div>
        ))}
      </div>
      {r.overdue.length > 0 && (
        <p className="mt-3 text-xs font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {r.overdue.length} overdue task{r.overdue.length > 1 ? 's' : ''} — clear before event day.
        </p>
      )}
    </section>
  )
}

// ─── Event tasks ─────────────────────────────────────────────────────────────

export function EventTasks({ booking }) {
  const dispatch = useDispatch()
  const staff = useSelector((s) => s.staff.list)
  const [title, setTitle] = useState('')
  const tasks = [...(booking.tasks ?? [])].sort((a, b) => new Date(a.due) - new Date(b.due))

  return (
    <section className={card}>
      <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2"><ListChecks size={17} className="text-teal-600" /> Tasks</h3>
      <div className="space-y-2 mb-4">
        {tasks.map((t) => {
          const overdue = t.status !== 'done' && isPast(new Date(t.due)) && !isToday(new Date(t.due))
          return (
            <div key={t.id} className="flex items-center gap-2.5 text-sm">
              <button onClick={() => dispatch(setTaskStatus({ id: booking.id, taskId: t.id, status: t.status === 'done' ? 'open' : 'done' }))} className="shrink-0">
                {t.status === 'done' ? <CheckCircle2 size={17} className="text-teal-600" /> : <Circle size={17} className="text-stone-300 hover:text-teal-500" />}
              </button>
              <span className={`flex-1 min-w-0 truncate ${t.status === 'done' ? 'line-through text-stone-400' : 'text-stone-700'}`}>{t.title}</span>
              {t.status === 'blocked' && <span className="rounded-full bg-orange-100 text-orange-600 px-2 py-0.5 text-[10px] font-bold">blocked</span>}
              <span className={`text-[11px] ${overdue ? 'text-red-600 font-bold' : 'text-stone-400'}`}>{format(new Date(t.due), 'd MMM')}</span>
              <select value={t.assignee ?? ''} onChange={(e) => dispatch(assignTask({ id: booking.id, taskId: t.id, staffId: e.target.value || null }))} className={`${input} w-28`}>
                <option value="">unassigned</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {t.status !== 'done' && (
                <button
                  onClick={() => dispatch(setTaskStatus({ id: booking.id, taskId: t.id, status: t.status === 'blocked' ? 'open' : 'blocked' }))}
                  className="text-stone-300 hover:text-orange-500" title="Block / unblock"
                ><Ban size={13} /></button>
              )}
            </div>
          )
        })}
        {!tasks.length && <p className="text-sm text-stone-400">No tasks — they appear automatically as the booking moves stages.</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          dispatch(addTask({ id: booking.id, task: { title: title.trim(), due: new Date().toISOString(), role: 'manual' } }))
          setTitle('')
        }}
        className="flex gap-2"
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" className={`${input} flex-1`} />
        <button className="rounded-lg bg-teal-700 text-cream-50 px-2.5 grid place-items-center hover:bg-teal-600"><Plus size={14} /></button>
      </form>
    </section>
  )
}

// ─── Expected cost estimate (before event — distinct from actuals) ──────────

export function EstimateCard({ booking }) {
  const dispatch = useDispatch()
  const est = booking.estimate ?? {}
  const estTotal = estimateTotal(booking)
  const quote = booking.amount ?? 0
  const expProfit = quote - estTotal
  const margin = quote > 0 ? Math.round((expProfit / quote) * 100) : 0

  return (
    <section className={card}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-teal-900 flex items-center gap-2"><Calculator size={17} className="text-teal-600" /> Expected cost &amp; margin</h3>
        <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase">estimates</span>
      </div>
      <p className="text-[11px] text-stone-400 mb-4">Pre-event projection from standards — not actual expense. Owner sets rates.</p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
        {EXPENSE_CATEGORIES.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1 text-stone-600">{c.label}</span>
            <input
              type="number" min="0" placeholder="₹0"
              value={est[c.id] ?? ''}
              onChange={(e) => dispatch(setEstimate({ id: booking.id, category: c.id, amount: Number(e.target.value) || 0 }))}
              className={`${input} w-24 text-right`}
            />
          </label>
        ))}
      </div>
      <div className="border-t border-stone-100 pt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <span className="text-stone-500">Expected cost: <strong className="text-stone-800">{fmtINR(estTotal)}</strong></span>
        <span className="text-stone-500">Expected profit: <strong className={expProfit >= 0 ? 'text-teal-700' : 'text-red-600'}>{fmtINR(expProfit)}</strong></span>
        <span className="text-stone-500">Margin: <strong className={margin >= 15 ? 'text-teal-700' : 'text-amber-600'}>{margin}%</strong></span>
        {margin < 0 && quote > 0 && estTotal > 0 && <span className="text-xs font-bold text-red-600">⚠ estimate exceeds quote</span>}
      </div>
    </section>
  )
}

// ─── Next-day closing ────────────────────────────────────────────────────────

const CLOSING_STEPS = [
  { key: 'leftovers', label: 'Collect leftover / unrecorded expenses' },
  { key: 'expensesVerified', label: 'Verify all expenses & receipts' },
  { key: 'vendorChecked', label: 'Check vendor payments & balances' },
  { key: 'balanceCollected', label: 'Collect remaining customer balance' },
  { key: 'reconciled', label: 'Reconcile — review variance below' },
]

export function ClosingSection({ booking }) {
  const dispatch = useDispatch()
  const c = booking.closing ?? {}
  const actual = actualByCategory(booking)
  const estTotal = estimateTotal(booking)
  const actTotal = actualTotal(booking)
  const received = receiptsTotal(booking)
  const variance = actTotal - estTotal

  return (
    <section className={card}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-teal-900 flex items-center gap-2"><FileCheck2 size={17} className="text-teal-600" /> Next-day closing</h3>
        {c.closed && <span className="rounded-full bg-teal-100 text-teal-700 px-2.5 py-1 text-[10px] font-bold">CLOSED {c.closedAt ? `· ${format(new Date(c.closedAt), 'd MMM')}` : ''}</span>}
      </div>
      <div className="space-y-2.5 mb-5">
        {CLOSING_STEPS.map((s) => (
          <label key={s.key} className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={!!c[s.key]} onChange={() => dispatch(toggleClosing({ id: booking.id, key: s.key }))} className="accent-teal-700" />
            <span className={c[s.key] ? 'text-stone-500 line-through' : 'text-stone-700'}>{s.label}</span>
          </label>
        ))}
      </div>

      {/* estimated vs actual */}
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Estimate vs actual</p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-stone-400 border-b border-stone-100">
              <th className="py-1.5 pr-3 font-medium">Category</th>
              <th className="py-1.5 pr-3 font-medium text-right">Estimated</th>
              <th className="py-1.5 pr-3 font-medium text-right">Actual</th>
              <th className="py-1.5 font-medium text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            {EXPENSE_CATEGORIES.map((cat) => {
              const e = booking.estimate?.[cat.id] ?? 0
              const a = actual[cat.id] ?? 0
              if (!e && !a) return null
              const v = a - e
              return (
                <tr key={cat.id} className="border-b border-stone-50">
                  <td className="py-1.5 pr-3 text-stone-600">{cat.label}</td>
                  <td className="py-1.5 pr-3 text-right text-stone-500">{e ? fmtINR(e) : '—'}</td>
                  <td className="py-1.5 pr-3 text-right text-stone-700">{a ? fmtINR(a) : '—'}</td>
                  <td className={`py-1.5 text-right font-semibold ${v > 0 ? 'text-red-600' : 'text-teal-700'}`}>{e || a ? `${v >= 0 ? '+' : ''}${fmtINR(v)}` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-stone-800">
              <td className="py-2 pr-3">Total</td>
              <td className="py-2 pr-3 text-right">{fmtINR(estTotal)}</td>
              <td className="py-2 pr-3 text-right">{fmtINR(actTotal)}</td>
              <td className={`py-2 text-right ${variance > 0 ? 'text-red-600' : 'text-teal-700'}`}>{variance >= 0 ? '+' : ''}{fmtINR(variance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
        <p className="text-xs text-stone-500">
          Revenue {fmtINR(booking.amount ?? 0)} · received {fmtINR(received)} · actual margin{' '}
          <strong className="text-stone-700">{booking.amount ? Math.round(((booking.amount - actTotal) / booking.amount) * 100) : 0}%</strong>
        </p>
        <button
          onClick={() => {
            dispatch(toggleClosing({ id: booking.id, key: 'closed' }))
            if (!c.closed && booking.status !== 'done') dispatch(moveBooking({ id: booking.id, status: 'done' }))
          }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${c.closed ? 'bg-stone-200 text-stone-600' : 'bg-teal-700 text-cream-50 hover:bg-teal-600'}`}
        >
          {c.closed ? 'Reopen event' : 'Close event'}
        </button>
      </div>
    </section>
  )
}

// ─── Staff view — the restricted event view a staff member sees (§14) ────────
// No quotation, prices, costs, margins, customer payment history or vendor
// balances. Only what they need to execute.

const ROLE_LABELS = {
  owner: 'Owner', sales: 'Sales / booking', coordinator: 'Event coordinator',
  chef: 'Chef / kitchen', procurement: 'Procurement', service: 'Service / manpower',
  accounts: 'Accounts',
}

export function StaffView({ booking, staff }) {
  const [asRole, setAsRole] = useState('coordinator')
  const menu = booking.menuItems ?? []
  const tasks = (booking.tasks ?? []).filter((t) => t.status !== 'done')
  const c = booking.closing ?? {}

  return (
    <div className="max-w-2xl space-y-5">
      <section className={card}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-teal-900">Staff event view — {booking.ref}</h3>
          <select value={asRole} onChange={(e) => setAsRole(e.target.value)} className={input}>
            {Object.entries(ROLE_LABELS).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
          </select>
        </div>
        <p className="text-xs text-stone-400 mb-4">
          What a {ROLE_LABELS[asRole].toLowerCase()} sees on their phone — no quotations, prices,
          costs, margins, customer payment history or vendor balances.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <p className="text-stone-700"><span className="text-stone-400">When:</span> {format(new Date(booking.date), 'EEEE, d MMMM yyyy · h:mm a')}</p>
          <p className="text-stone-700"><span className="text-stone-400">Guests:</span> {booking.guests} ({booking.pax?.veg ?? 0} veg · {booking.pax?.nonVeg ?? 0} non-veg)</p>
          <p className="text-stone-700 sm:col-span-2"><span className="text-stone-400">Venue:</span> {booking.venue}</p>
          <p className="text-stone-700"><span className="text-stone-400">Scope:</span> {booking.cateringType ?? 'full'} catering</p>
          <p className="text-stone-700"><span className="text-stone-400">Menu:</span> {booking.menuApproved ? `approved v${booking.menuVersions?.length ?? 0}` : 'draft — pending approval'}</p>
        </div>
      </section>

      <section className={card}>
        <h3 className="font-semibold text-teal-900 mb-3">Assigned menu</h3>
        {booking.menuApproved ? (
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-stone-700">
            {menu.map((m) => <li key={m.dish}>· {m.dish}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-stone-400">Menu not yet approved — pending final version.</p>
        )}
      </section>

      <section className={card}>
        <h3 className="font-semibold text-teal-900 mb-3">Your tasks &amp; checklist</h3>
        {tasks.length || (booking.logistics ?? []).length ? (
          <ul className="space-y-2 text-sm">
            {tasks.filter((t) => t.role === 'manual' || t.role === asRole).map((t) => (
              <li key={t.id} className="flex items-center gap-2.5 text-stone-700">
                <Circle size={14} className="text-stone-300 shrink-0" />
                {t.title}
                <span className="text-[11px] text-stone-400">· due {format(new Date(t.due), 'd MMM')}</span>
              </li>
            ))}
            {asRole === 'service' && (booking.logistics ?? []).length > 0 && (
              <li className="text-stone-500 text-xs">Logistics: {(booking.logistics ?? []).length} items checked off</li>
            )}
          </ul>
        ) : (
          <p className="text-sm text-stone-400">No tasks assigned to this role yet.</p>
        )}
      </section>
    </div>
  )
}
