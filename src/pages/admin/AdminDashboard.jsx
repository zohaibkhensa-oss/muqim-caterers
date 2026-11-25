import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { isToday, isThisWeek, format, compareAsc } from 'date-fns'
import { Inbox, CalendarClock, IndianRupee, CheckCircle2, ArrowRight } from 'lucide-react'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { fmtINR, packageById } from '@/data/mock'

export default function AdminDashboard() {
  const bookings = useSelector((s) => s.bookings.list)

  const openBookings = bookings.filter((b) => b.status !== 'done')
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

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Inbox} label="New inquiries" value={thisWeekInquiries.length} sub={`${inquiries.length} awaiting response`} />
        <StatCard icon={CalendarClock} label="Upcoming events" value={upcoming.length} sub={`${todaysEvents.length} today`} />
        <StatCard icon={IndianRupee} label="Pipeline value" value={fmtINR(pipelineValue)} sub="open bookings" />
        <StatCard icon={CheckCircle2} label="Active events" value={confirmedThisMonth} sub="confirmed or in progress" />
      </div>

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
            <Link to="/admin/bookings" className="text-xs font-semibold text-teal-700 inline-flex items-center gap-1">
              Board <ArrowRight size={13} />
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
