import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { isToday, isThisWeek, format, compareAsc, differenceInCalendarDays, isPast } from 'date-fns'
import {
  Inbox, CalendarClock, IndianRupee, CheckCircle2, ArrowRight,
  AlertCircle, PhoneCall, Truck, FileCheck2, ShieldCheck,
} from 'lucide-react'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { fmtINR, packageById } from '@/data/mock'
import { readiness } from '@/lib/tasks'

export default function AdminDashboard() {
  const bookings = useSelector((s) => s.bookings.list)

  const openBookings = bookings.filter((b) => b.status !== 'done' && !b.closing?.closed)
  const inquiries = bookings.filter((b) => b.status === 'inquiry')
  const thisWeekInquiries = inquiries.filter((b) => isThisWeek(new Date(b.createdAt)))
  const todaysEvents = bookings.filter((b) => isToday(new Date(b.date)))
  const upcoming = openBookings
      .filter((b) => new Date(b.date) >= new Date())
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
  const pipelineValue = openBookings.reduce((sum, b) => sum + (b.amount ?? 0), 0)
  const confirmedThisMonth = bookings.filter(
    (b) => ['confirmed', 'prep', 'delivered'].includes(b.status)
  ).length

  // ── Actions, not just statistics (blueprint §4) ──
  const allTasks = bookings.flatMap((b) => (b.tasks ?? []).map((t) => ({ ...t, booking: b })))
  const openTasks = allTasks.filter((t) => t.status !== 'done')
  const overdueTasks = openTasks.filter((t) => isPast(new Date(t.due)) && !isToday(new Date(t.due)))
  const todayTasks = openTasks.filter((t) => isToday(new Date(t.due)))
  const newLeads = inquiries.filter((b) => (b.leadStatus ?? 'new') === 'new')
  const followUpsDue = inquiries.filter((b) => b.followUp && new Date(b.followUp) <= new Date())
  const supplierPending = bookings.flatMap((b) =>
    (b.procurement ?? []).filter((g) => g.status !== 'confirmed').map((g) => ({ b, g })))
  const nextWeek = openBookings.filter((b) => {
    const d = differenceInCalendarDays(new Date(b.date), new Date())
    return d >= 0 && d <= 7
  })
  const unready = nextWeek.filter((b) => readiness(b).pct < 100)
  const awaitingClose = bookings.filter((b) => b.status === 'delivered' && !b.closing?.closed)

  const actions = [
    overdueTasks.length && { icon: AlertCircle, n: overdueTasks.length, label: 'overdue tasks', to: '/admin/tasks', tone: 'text-red-600' },
    todayTasks.length && { icon: ListChecks, n: todayTasks.length, label: 'tasks due today', to: '/admin/tasks', tone: 'text-amber-600' },
    newLeads.length && { icon: Inbox, n: newLeads.length, label: 'new leads awaiting contact', to: '/admin/leads', tone: 'text-teal-700' },
    followUpsDue.length && { icon: PhoneCall, n: followUpsDue.length, label: 'follow-ups due', to: '/admin/leads', tone: 'text-amber-600' },
    supplierPending.length && { icon: Truck, n: supplierPending.length, label: 'supplier lists unconfirmed', to: '/admin/vendors', tone: 'text-amber-600' },
    unready.length && { icon: ShieldCheck, n: unready.length, label: 'events this week not ready', to: '/admin/calendar', tone: 'text-amber-600' },
    awaitingClose.length && { icon: FileCheck2, n: awaitingClose.length, label: 'events awaiting next-day closing', to: '/admin/bookings', tone: 'text-teal-700' },
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Inbox} label="New inquiries" value={thisWeekInquiries.length} sub={`${inquiries.length} awaiting response`} />
        <StatCard icon={CalendarClock} label="Upcoming events" value={upcoming.length} sub={`${todaysEvents.length} today`} />
        <StatCard icon={IndianRupee} label="Pipeline value" value={fmtINR(pipelineValue)} sub="open bookings" />
        <StatCard icon={CheckCircle2} label="Active events" value={confirmedThisMonth} sub="confirmed or in progress" />
      </div>

      {actions.length > 0 && (
        <section className="bg-white rounded-xl border border-stone-200">
          <header className="px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-teal-900">Needs action</h2>
          </header>
          <ul className="divide-y divide-stone-100">
            {actions.map((a) => (
              <li key={a.label}>
                <Link to={a.to} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50">
                  <a.icon size={16} className={a.tone} />
                  <span className="text-sm"><strong>{a.n}</strong> {a.label}</span>
                  <ArrowRight size={13} className="ml-auto text-stone-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-stone-200">
          <header className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-teal-900">Today's events</h2>
            <Link to="/admin/calendar" className="text-xs font-semibold text-teal-700 inline-flex items-center gap-1">
              Calendar <ArrowRight size={13} />
            </Link>
          </header>
          {todaysEvents.length ? (
            <ul className="divide-y divide-stone-100">
              {todaysEvents.map((b) => (
                <li key={b.id}>
                  <Link to={`/admin/bookings/${b.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-stone-50">
                    <div>
                      <p className="font-medium text-sm">{b.client.name} — {b.eventType}</p>
                      <p className="text-xs text-stone-500">{format(new Date(b.date), 'h:mm a')} · {b.venue}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-sm text-stone-400 text-center">No events today.</p>
          )}
        </section>

        <section className="bg-white rounded-xl border border-stone-200">
          <header className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-teal-900">Latest inquiries</h2>
            <Link to="/admin/leads" className="text-xs font-semibold text-teal-700 inline-flex items-center gap-1">
              Lead inbox <ArrowRight size={13} />
            </Link>
          </header>
          <ul className="divide-y divide-stone-100">
            {bookings.slice(0, 5).map((b) => (
              <li key={b.id}>
                <Link to={`/admin/bookings/${b.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{b.ref} · {b.client.name}</p>
                    <p className="text-xs text-stone-500">
                      {b.eventType} · {format(new Date(b.date), 'd MMM')} · {packageById(b.packageId)?.name ?? 'Custom'}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
