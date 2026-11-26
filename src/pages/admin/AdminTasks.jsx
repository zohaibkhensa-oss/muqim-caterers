import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { format, isToday, isPast } from 'date-fns'
import { CheckCircle2, Circle, AlertCircle, Ban, ListChecks } from 'lucide-react'
import { setTaskStatus, assignTask } from '@/features/bookings/bookingsSlice'

const input = 'rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-400 bg-white'

const bucketOf = (t) => {
  if (t.status === 'done') return 'done'
  if (t.status === 'blocked') return 'blocked'
  const d = new Date(t.due)
  if (isPast(d) && !isToday(d)) return 'overdue'
  if (isToday(d)) return 'today'
  return 'upcoming'
}
const BUCKETS = [
  { id: 'overdue', label: 'Overdue', accent: 'text-red-600', chip: 'bg-red-100 text-red-600' },
  { id: 'today', label: 'Due today', accent: 'text-amber-600', chip: 'bg-amber-100 text-amber-700' },
  { id: 'upcoming', label: 'Upcoming', accent: 'text-teal-700', chip: 'bg-teal-100 text-teal-700' },
  { id: 'blocked', label: 'Blocked', accent: 'text-orange-600', chip: 'bg-orange-100 text-orange-700' },
  { id: 'done', label: 'Done', accent: 'text-stone-400', chip: 'bg-stone-100 text-stone-500' },
]

export default function AdminTasks() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const bookings = useSelector((s) => s.bookings.list)
  const staff = useSelector((s) => s.staff.list)
  const [bucket, setBucket] = useState('all')
  const [hideDone, setHideDone] = useState(true)

  const rows = useMemo(() => {
    const out = []
    bookings.forEach((b) =>
      (b.tasks ?? []).forEach((t) => out.push({ ...t, booking: b, bucket: bucketOf(t) })),
    )
    return out.sort((a, b) => new Date(a.due) - new Date(b.due))
  }, [bookings])

  const visible = rows.filter((r) => (bucket === 'all' || r.bucket === bucket) && (!hideDone || r.status !== 'done'))
  const count = (k) => rows.filter((r) => r.bucket === k).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-teal-900">Tasks &amp; Reminders</h2>
          <p className="text-xs text-stone-500">Auto-created as bookings move through stages — clear the blockers before event day.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-stone-500">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> hide done
        </label>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setBucket('all')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${bucket === 'all' ? 'bg-teal-700 text-cream-50' : 'bg-white border border-stone-200 text-stone-600'}`}>
          All ({rows.length})
        </button>
        {BUCKETS.map((b) => (
          <button key={b.id} onClick={() => setBucket(b.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${bucket === b.id ? 'bg-teal-700 text-cream-50' : 'bg-white border border-stone-200 text-stone-600'}`}>
            {b.label} ({count(b.id)})
          </button>
        ))}
      </div>

      {!visible.length && (
        <div className="bg-white rounded-xl border border-stone-200 p-14 text-center">
          <ListChecks size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-400">Nothing pending — tasks appear as bookings move stages.</p>
        </div>
      )}

      <div className="space-y-2">
        {visible.map((t) => (
          <div key={`${t.booking.id}-${t.id}`} className={`bg-white rounded-xl border px-4 py-3 flex flex-wrap items-center gap-3 ${t.bucket === 'overdue' ? 'border-red-200' : 'border-stone-200'}`}>
            <button
              onClick={() => dispatch(setTaskStatus({ id: t.booking.id, taskId: t.id, status: t.status === 'done' ? 'open' : 'done' }))}
              className="shrink-0"
              title={t.status === 'done' ? 'Reopen' : 'Mark done'}
            >
              {t.status === 'done' ? <CheckCircle2 size={20} className="text-teal-600" /> : <Circle size={20} className="text-stone-300 hover:text-teal-500" />}
            </button>
            <div className="min-w-52 flex-1">
              <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-stone-400' : 'text-stone-800'}`}>{t.title}</p>
              <p className="text-[11px] text-stone-400">
                <button onClick={() => navigate(`/admin/bookings/${t.booking.id}`)} className="text-teal-700 font-semibold hover:underline">{t.booking.ref}</button>
                {' '}· {t.booking.client.name} · {format(new Date(t.booking.date), 'd MMM')} · role: {t.role ?? '—'}
              </p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${BUCKETS.find((x) => x.id === t.bucket)?.chip}`}>
              {t.bucket === 'done' ? 'done' : `due ${format(new Date(t.due), 'd MMM')}`}
            </span>
            {t.status !== 'done' && (
              <div className="flex items-center gap-2">
                <select value={t.assignee ?? ''} onChange={(e) => dispatch(assignTask({ id: t.booking.id, taskId: t.id, staffId: e.target.value || null }))} className={input}>
                  <option value="">unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button
                  onClick={() => dispatch(setTaskStatus({ id: t.booking.id, taskId: t.id, status: t.status === 'blocked' ? 'open' : 'blocked' }))}
                  className={`p-1.5 rounded-lg ${t.status === 'blocked' ? 'bg-orange-100 text-orange-600' : 'text-stone-400 hover:bg-stone-100'}`}
                  title={t.status === 'blocked' ? 'Unblock' : 'Mark blocked'}
                >
                  {t.status === 'blocked' ? <AlertCircle size={15} /> : <Ban size={15} />}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
