import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Phone, Mail, MapPin, Users, CalendarDays, NotebookPen, Send, IndianRupee, Plus, Trash2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { BOOKING_STATUSES, statusById, cateringTypeById, EXPENSE_CATEGORIES, fmtINR, packageById } from '@/data/mock'
import { moveBooking, addNote, assignStaff, addReceipt, addExpense, selectBookingById, setQuote } from '@/features/bookings/bookingsSlice'
import BookingOperations from '@/pages/admin/BookingOperations'
import { Readiness, EventTasks, EstimateCard, ClosingSection, StaffView } from '@/pages/admin/EventControl'

const card = 'bg-white rounded-xl border border-stone-200 p-5'

export default function AdminBookingDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const booking = useSelector((s) => selectBookingById(s, id))
  const staff = useSelector((s) => s.staff.list)
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState({ label: 'Payment', amount: '' })
  const [expense, setExpense] = useState({ category: 'Purchases', label: '', amount: '' })
  const [tab, setTab] = useState('overview')
  const [editQuote, setEditQuote] = useState(false)
  const [quoteAmt, setQuoteAmt] = useState('')

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Booking not found.</p>
        <Link to="/admin/bookings" className="text-teal-700 font-semibold">← Back to bookings</Link>
      </div>
    )
  }

  const pkg = booking.packageId ? packageById(booking.packageId) : null
  const currentIdx = BOOKING_STATUSES.findIndex((s) => s.id === booking.status)
  const nextStatus = BOOKING_STATUSES[currentIdx + 1]
  const ctype = cateringTypeById(booking.cateringType)

  const received = booking.receipts.reduce((s, r) => s + r.amount, 0)
  const spent = booking.expenses.reduce((s, e) => s + e.amount, 0)
  const balance = (booking.amount ?? 0) - received
  const profit = (booking.amount ?? 0) - spent

  return (
    <div>
      <Link to="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-teal-700 mb-5">
        <ArrowLeft size={15} /> Bookings
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-2xl font-semibold text-teal-900">{booking.ref}</h2>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={booking.status}
            onChange={(e) => dispatch(moveBooking({ id: booking.id, status: e.target.value }))}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          {nextStatus && (
            <button
              onClick={() => dispatch(moveBooking({ id: booking.id, status: nextStatus.id }))}
              className="rounded-lg bg-teal-700 text-cream-50 px-4 py-2 text-sm font-semibold hover:bg-teal-600"
            >
              Mark {nextStatus.label} →
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-stone-200 p-1 w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'operations', label: `Operations${(booking.menuItems ?? []).length ? ` · ${booking.menuItems.length} dishes` : ''}` },
          { id: 'staffview', label: 'Staff view' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-teal-700 text-cream-50' : 'text-stone-500 hover:text-teal-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'operations' && <BookingOperations booking={booking} />}

      {tab === 'staffview' && <StaffView booking={booking} staff={staff} />}

      {tab === 'overview' && <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section className={card}>
            <h3 className="font-semibold text-teal-900 mb-4">Event details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <p className="flex items-center gap-2.5 text-stone-700">
                <CalendarDays size={16} className="text-teal-600 shrink-0" />
                {format(new Date(booking.date), 'EEEE, d MMMM yyyy · h:mm a')}
              </p>
              <p className="flex items-center gap-2.5 text-stone-700">
                <Users size={16} className="text-teal-600 shrink-0" />
                {booking.guests} guests ({booking.pax.veg} veg · {booking.pax.nonVeg} non-veg) · {booking.eventType}
              </p>
              <p className="flex items-center gap-2.5 text-stone-700">
                <IndianRupee size={16} className="text-teal-600 shrink-0" />
                {ctype.label}
                <span className="text-xs text-stone-400">— {ctype.desc}</span>
              </p>
              <p className="flex items-start gap-2.5 text-stone-700 sm:col-span-2">
                <MapPin size={16} className="text-teal-600 shrink-0 mt-0.5" />
                {booking.venue}
              </p>
            </div>
          </section>

          <Readiness booking={booking} />
          <EventTasks booking={booking} />

          <section className={card}>
            <h3 className="font-semibold text-teal-900 mb-4">Menu & quote</h3>
            {pkg ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-sm">{pkg.name}</p>
                  <p className="text-sm text-stone-500">{fmtINR(pkg.pricePerHead)}/head</p>
                </div>
                <ul className="text-sm text-stone-600 space-y-1.5 mb-4">
                  {pkg.items.slice(0, 4).map((i) => <li key={i}>· {i}</li>)}
                  {pkg.items.length > 4 && <li className="text-stone-400">· +{pkg.items.length - 4} more</li>}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-stone-600 mb-4">Custom menu — see notes below.</p>
            )}
            <div className="border-t border-stone-100 pt-4 flex justify-between items-center gap-3">
              <span className="text-sm text-stone-500">
                {booking.guests} guests × {pkg ? fmtINR(pkg.pricePerHead) : '—'}
                {(booking.quoteVersions ?? []).length > 0 && <span className="ml-2 text-[10px] font-bold text-stone-400">v{(booking.quoteVersions).length}</span>}
              </span>
              {editQuote ? (
                <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); const a = Number(quoteAmt); if (a > 0) { dispatch(setQuote({ id: booking.id, amount: a })); } setEditQuote(false) }}>
                  <input type="number" autoFocus value={quoteAmt} onChange={(e) => setQuoteAmt(e.target.value)} className="w-28 rounded-lg border border-stone-200 px-2 py-1 text-sm" placeholder="₹" />
                  <button className="rounded-lg bg-teal-700 text-cream-50 px-2.5 text-xs font-semibold">Save</button>
                </form>
              ) : (
                <button onClick={() => { setQuoteAmt(booking.amount ?? ''); setEditQuote(true) }} className="text-lg font-semibold text-teal-800 hover:underline" title="Edit quotation (creates a new version)">
                  {booking.amount != null ? fmtINR(booking.amount) : 'Set quote'}
                </button>
              )}
            </div>
          </section>

          <section className={card}>
            <h3 className="font-semibold text-teal-900 mb-4">Event ledger</h3>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-3.5">
                <p className="text-xs text-stone-500">Quotation</p>
                <p className="text-lg font-semibold text-teal-800">{booking.amount != null ? fmtINR(booking.amount) : 'Pending'}</p>
              </div>
              <div className="rounded-xl bg-sky-50 border border-sky-200 p-3.5">
                <p className="text-xs text-stone-500">Received</p>
                <p className="text-lg font-semibold text-sky-800">{fmtINR(received)}</p>
              </div>
              <div className={`rounded-xl border p-3.5 ${balance > 0 ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
                <p className="text-xs text-stone-500">Balance due</p>
                <p className={`text-lg font-semibold ${balance > 0 ? 'text-amber-700' : 'text-stone-500'}`}>{fmtINR(balance)}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2.5">Receipts</p>
                <ul className="space-y-1.5 mb-3">
                  {booking.receipts.map((r, i) => (
                    <li key={i} className="flex justify-between text-sm bg-sky-50/60 rounded-lg px-3 py-2">
                      <span className="text-stone-700">{r.label} <span className="text-xs text-stone-400">· {format(new Date(r.at), 'd MMM')}</span></span>
                      <span className="font-semibold text-sky-800">{fmtINR(r.amount)}</span>
                    </li>
                  ))}
                  {!booking.receipts.length && <li className="text-sm text-stone-400">No payments recorded.</li>}
                </ul>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const amt = Number(receipt.amount)
                    if (!amt || !receipt.label.trim()) return
                    dispatch(addReceipt({ id: booking.id, receipt: { label: receipt.label.trim(), amount: amt } }))
                    setReceipt({ label: 'Payment', amount: '' })
                  }}
                  className="flex gap-2"
                >
                  <input value={receipt.label} onChange={(e) => setReceipt({ ...receipt, label: e.target.value })} placeholder="Advance / Payment" className="flex-1 min-w-0 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400" />
                  <input type="number" value={receipt.amount} onChange={(e) => setReceipt({ ...receipt, amount: e.target.value })} placeholder="₹" className="w-20 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400" />
                  <button className="rounded-lg bg-sky-600 text-white px-2.5 grid place-items-center hover:bg-sky-500"><Plus size={14} /></button>
                </form>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2.5">Expenses</p>
                <ul className="space-y-1.5 mb-3">
                  {booking.expenses.map((x, i) => (
                    <li key={i} className="flex justify-between text-sm bg-stone-50 rounded-lg px-3 py-2">
                      <span className="text-stone-700 min-w-0 truncate">
                        <span className="text-[10px] font-bold uppercase text-stone-400 mr-1.5">{x.category}</span>
                        {x.label}
                      </span>
                      <span className="font-semibold text-stone-700 shrink-0 ml-2">{fmtINR(x.amount)}</span>
                    </li>
                  ))}
                  {!booking.expenses.length && <li className="text-sm text-stone-400">No expenses yet.</li>}
                </ul>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const amt = Number(expense.amount)
                    if (!amt || !expense.label.trim()) return
                    dispatch(addExpense({ id: booking.id, expense: { category: expense.category, label: expense.label.trim(), amount: amt } }))
                    setExpense({ category: 'Purchases', label: '', amount: '' })
                  }}
                  className="flex gap-2"
                >
                  <select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })} className="w-24 rounded-lg border border-stone-200 px-2 py-1.5 text-xs bg-white">
                    {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input value={expense.label} onChange={(e) => setExpense({ ...expense, label: e.target.value })} placeholder="Item" className="flex-1 min-w-0 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400" />
                  <input type="number" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} placeholder="₹" className="w-20 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400" />
                  <button className="rounded-lg bg-stone-700 text-white px-2.5 grid place-items-center hover:bg-stone-600"><Plus size={14} /></button>
                </form>
              </div>
            </div>

            <div className="border-t border-stone-100 mt-5 pt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <span className="text-stone-500">Total spent: <strong className="text-stone-800">{fmtINR(spent)}</strong></span>
              <span className="text-stone-500">
                Event {profit >= 0 ? 'profit' : 'loss'}:{' '}
                <strong className={profit >= 0 ? 'text-teal-700' : 'text-red-600'}>{fmtINR(Math.abs(profit))}</strong>
                {booking.status !== 'done' && <span className="text-xs text-stone-400"> (so far)</span>}
              </span>
            </div>
          </section>

          <EstimateCard booking={booking} />
          <ClosingSection booking={booking} />

          <section className={card}>
            <h3 className="font-semibold text-teal-900 mb-4">Internal notes</h3>
            <ul className="space-y-2 mb-4">
              {booking.notes.length ? booking.notes.map((n, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-stone-700 bg-stone-50 rounded-lg px-3 py-2.5">
                  <NotebookPen size={15} className="text-teal-500 shrink-0 mt-0.5" /> {n}
                </li>
              )) : <li className="text-sm text-stone-400">No notes yet.</li>}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!note.trim()) return
                dispatch(addNote({ id: booking.id, note: note.trim() }))
                setNote('')
              }}
              className="flex gap-2"
            >
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
              />
              <button className="rounded-lg bg-teal-700 text-cream-50 px-3.5 grid place-items-center hover:bg-teal-600">
                <Send size={15} />
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-5">
          <section className={card}>
            <h3 className="font-semibold text-teal-900 mb-4">Client</h3>
            <p className="font-medium">{booking.client.name}</p>
            <p className="flex items-center gap-2 text-sm text-stone-600 mt-2"><Phone size={14} className="text-teal-600" /> {booking.client.phone}</p>
            {booking.client.email && (
              <p className="flex items-center gap-2 text-sm text-stone-600 mt-1.5"><Mail size={14} className="text-teal-600" /> {booking.client.email}</p>
            )}
          </section>

          <section className={card}>
            <h3 className="font-semibold text-teal-900 mb-4">Assigned staff</h3>
            <div className="space-y-2">
              {staff.map((s) => {
                const assigned = booking.staffIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => dispatch(assignStaff({ id: booking.id, staffId: s.id }))}
                    className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                      assigned ? 'border-teal-500 bg-teal-50' : 'border-stone-200 hover:border-teal-300'
                    }`}
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className={`text-xs ${assigned ? 'text-teal-700 font-semibold' : 'text-stone-400'}`}>
                      {s.role}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className={card}>
            <h3 className="font-semibold text-teal-900 mb-4">Status history</h3>
            <ol className="relative border-l-2 border-stone-200 ml-2 space-y-4">
              {booking.statusHistory.map((h, i) => (
                <li key={i} className="pl-5 relative">
                  <span className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white ${statusById(h.status).dot}`} />
                  <p className="text-sm font-medium">{statusById(h.status).label}</p>
                  <p className="text-xs text-stone-400">{format(new Date(h.at), 'd MMM, h:mm a')}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>}
    </div>
  )
}
