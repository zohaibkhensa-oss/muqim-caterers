import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { AlertTriangle, Inbox, ArrowRight } from 'lucide-react'
import { fmtINR } from '@/data/mock'
import { LEAD_STATUSES, LEAD_SOURCES } from '@/lib/tasks'
import { moveBooking, updateBooking } from '@/features/bookings/bookingsSlice'

const input = 'rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400 bg-white'
const leadColor = (s) => ({
  new: 'bg-teal-100 text-teal-700', contacted: 'bg-sky-100 text-sky-700',
  menu_sent: 'bg-indigo-100 text-indigo-700', selection: 'bg-violet-100 text-violet-700',
  quote_pending: 'bg-amber-100 text-amber-700', negotiation: 'bg-orange-100 text-orange-700',
  no_response: 'bg-stone-200 text-stone-600', lost: 'bg-red-100 text-red-600',
}[s] ?? 'bg-stone-100 text-stone-600')

export default function AdminLeads() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const bookings = useSelector((s) => s.bookings.list)
  const [filter, setFilter] = useState('all')
  const [srcFilter, setSrcFilter] = useState('all')

  const leads = useMemo(
    () => bookings.filter((b) => b.status === 'inquiry')
      .filter((b) => filter === 'all' || (b.leadStatus ?? 'new') === filter)
      .filter((b) => srcFilter === 'all' || (b.source ?? 'Website / QR') === srcFilter)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [bookings, filter, srcFilter],
  )
  const counts = useMemo(() => {
    const m = {}
    bookings.filter((b) => b.status === 'inquiry').forEach((b) => { m[b.leadStatus ?? 'new'] = (m[b.leadStatus ?? 'new'] ?? 0) + 1 })
    return m
  }, [bookings])

  const setLead = (b, patch) => dispatch(updateBooking({ id: b.id, patch }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-teal-900">Lead Inbox</h2>
          <p className="text-xs text-stone-500">Enquiries from all channels — work them to a quotation, then they leave this inbox.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={srcFilter} onChange={(e) => setSrcFilter(e.target.value)} className={input}>
            <option value="all">All sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* status pipeline filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === 'all' ? 'bg-teal-700 text-cream-50' : 'bg-white border border-stone-200 text-stone-600'}`}>
          All ({bookings.filter((b) => b.status === 'inquiry').length})
        </button>
        {LEAD_STATUSES.map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === s.id ? 'bg-teal-700 text-cream-50' : 'bg-white border border-stone-200 text-stone-600'}`}>
            {s.label} ({counts[s.id] ?? 0})
          </button>
        ))}
      </div>

      {!leads.length && (
        <div className="bg-white rounded-xl border border-stone-200 p-14 text-center">
          <Inbox size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-400">No leads here — enquiries from the website land in this inbox.</p>
        </div>
      )}

      <div className="space-y-3">
        {leads.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-stone-200 p-4 flex flex-wrap items-center gap-4">
            <div className="min-w-56 flex-1">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/admin/bookings/${b.id}`)} className="font-semibold text-teal-900 hover:underline">{b.client.name}</button>
                <span className="text-[10px] font-bold text-stone-400">{b.ref}</span>
                {b.possibleDuplicate && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-[10px] font-bold" title={`Possible duplicate of ${b.duplicateOf}`}>
                    <AlertTriangle size={10} /> dup? {b.duplicateOf}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {b.eventType} · {format(new Date(b.date), 'd MMM')} · {b.guests} pax · {b.venue}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">{b.client.phone} · via {b.source ?? 'Website / QR'}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${leadColor(b.leadStatus ?? 'new')}`}>
                {LEAD_STATUSES.find((s) => s.id === (b.leadStatus ?? 'new'))?.label}
              </span>
              <select value={b.leadStatus ?? 'new'} onChange={(e) => setLead(b, { leadStatus: e.target.value })} className={input}>
                {LEAD_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select value={b.source ?? 'Website / QR'} onChange={(e) => setLead(b, { source: e.target.value })} className={input} title="Lead source">
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="date" value={b.followUp?.slice(0, 10) ?? ''} onChange={(e) => setLead(b, { followUp: e.target.value })} className={input} title="Follow-up date" />
              {b.quote ? <span className="text-xs font-semibold text-teal-800">{fmtINR(b.quote)}</span> : null}
              <button
                onClick={() => dispatch(moveBooking({ id: b.id, status: 'quoted' }))}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-700 text-cream-50 px-3 py-1.5 text-xs font-semibold hover:bg-teal-600"
              >
                To quote <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
