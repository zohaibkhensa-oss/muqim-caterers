import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { format, startOfMonth, isPast, isToday } from 'date-fns'
import { BOOKING_STATUSES, statusById, fmtINR, packageById } from '@/data/mock'
import StatCard from '@/components/StatCard'
import { IndianRupee, CalendarCheck, Trophy, FileClock, Wallet, Truck } from 'lucide-react'

export default function AdminReports() {
  const bookings = useSelector((s) => s.bookings.list)
  const vendors = useSelector((s) => s.vendors.list)

  const byStatus = useMemo(
    () => BOOKING_STATUSES.map((s) => ({ ...s, count: bookings.filter((b) => b.status === s.id).length })),
    [bookings]
  )
  const maxStatus = Math.max(...byStatus.map((s) => s.count), 1)

  const byMonth = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => {
      const key = format(startOfMonth(new Date(b.date)), 'MMM yyyy')
      map.set(key, (map.get(key) ?? 0) + (b.amount ?? 0))
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [bookings])
  const maxMonth = Math.max(...byMonth.map(([, v]) => v), 1)

  const byPackage = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => {
      const name = packageById(b.packageId)?.name ?? 'Custom'
      map.set(name, (map.get(name) ?? 0) + 1)
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [bookings])
  const maxPkg = Math.max(...byPackage.map(([, v]) => v), 1)

  const byDish = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => (b.menuItems ?? []).forEach((m) => map.set(m.dish, (map.get(m.dish) ?? 0) + 1)))
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [bookings])
  const maxDish = Math.max(...byDish.map(([, v]) => v), 1)

  const totalBilled = bookings.filter((b) => b.status === 'done').reduce((s, b) => s + (b.amount ?? 0), 0)
  const upcomingValue = bookings.filter((b) => !['done'].includes(b.status)).reduce((s, b) => s + (b.amount ?? 0), 0)
  const pendingQuotes = bookings.filter((b) => b.status === 'quoted').length
  const customerOutstanding = bookings.reduce(
    (s, b) => s + Math.max((b.amount ?? 0) - b.receipts.reduce((r, x) => r + x.amount, 0), 0), 0
  )
  const vendorOutstanding = vendors.reduce((s, v) => s + v.balance, 0)

  const bySource = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => map.set(b.source ?? 'Website / QR', (map.get(b.source ?? 'Website / QR') ?? 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [bookings])
  const maxSource = Math.max(...bySource.map(([, v]) => v), 1)

  const taskStats = useMemo(() => {
    const all = bookings.flatMap((b) => b.tasks ?? [])
    const done = all.filter((t) => t.status === 'done')
    const overdue = all.filter((t) => t.status !== 'done' && isPast(new Date(t.due)) && !isToday(new Date(t.due)))
    const blocked = all.filter((t) => t.status === 'blocked')
    return { total: all.length, done: done.length, overdue: overdue.length, blocked: blocked.length }
  }, [bookings])

  const Section = ({ title, children }) => (
    <section className="bg-white rounded-xl border border-stone-200 p-5">
      <h3 className="font-semibold text-teal-900 mb-5">{title}</h3>
      {children}
    </section>
  )

  const Bar = ({ label, value, display, color = 'bg-teal-500', max }) => (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-stone-600 truncate">{label}</span>
      <div className="flex-1 h-6 bg-stone-100 rounded-md overflow-hidden">
        <div className={`h-full ${color} rounded-md`} style={{ width: `${Math.max((value / max) * 100, 4)}%` }} />
      </div>
      <span className="w-20 text-right text-sm font-medium">{display}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={IndianRupee} label="Billed (completed)" value={fmtINR(totalBilled)} />
        <StatCard icon={CalendarCheck} label="In pipeline" value={fmtINR(upcomingValue)} />
        <StatCard icon={FileClock} label="Pending quotations" value={pendingQuotes} sub="awaiting customer decision" />
        <StatCard icon={Wallet} label="Customer outstanding" value={fmtINR(customerOutstanding)} sub="yet to be collected" />
        <StatCard icon={Truck} label="Vendor outstanding" value={fmtINR(vendorOutstanding)} sub="payable to suppliers" />
        <StatCard icon={Trophy} label="Top package" value={byPackage[0]?.[0] ?? '—'} sub={`${byPackage[0]?.[1] ?? 0} bookings`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Bookings by stage">
          <div className="space-y-3">
            {byStatus.map((s) => (
              <Bar key={s.id} label={s.label} value={s.count} display={s.count} color={s.dot} max={maxStatus} />
            ))}
          </div>
        </Section>

        <Section title="Pipeline value by event month">
          <div className="space-y-3">
            {byMonth.map(([month, v]) => (
              <Bar key={month} label={month} value={v} display={fmtINR(v)} color="bg-gold-500" max={maxMonth} />
            ))}
          </div>
        </Section>

        <Section title="Bookings per package">
          <div className="space-y-3">
            {byPackage.map(([name, count]) => (
              <Bar key={name} label={name} value={count} display={count} max={maxPkg} />
            ))}
          </div>
        </Section>

        <Section title="Menu popularity — most-selected dishes">
          <div className="space-y-3">
            {byDish.length ? byDish.map(([dish, count]) => (
              <Bar key={dish} label={dish} value={count} display={`${count}×`} color="bg-gold-500" max={maxDish} />
            )) : <p className="text-sm text-stone-400">Dishes appear here once menus are selected on events.</p>}
          </div>
        </Section>

        <Section title="Lead pipeline by source">
          <div className="space-y-3">
            {bySource.length ? bySource.map(([src, count]) => (
              <Bar key={src} label={src} value={count} display={count} max={maxSource} />
            )) : <p className="text-sm text-stone-400">No leads yet.</p>}
          </div>
        </Section>

        <Section title="Task performance">
          <div className="space-y-3">
            <Bar label="Done" value={taskStats.done} display={taskStats.done} max={Math.max(taskStats.total, 1)} />
            <Bar label="Open" value={taskStats.total - taskStats.done - taskStats.overdue - taskStats.blocked} display={taskStats.total - taskStats.done - taskStats.overdue - taskStats.blocked} color="bg-sky-500" max={Math.max(taskStats.total, 1)} />
            <Bar label="Overdue" value={taskStats.overdue} display={taskStats.overdue} color="bg-red-500" max={Math.max(taskStats.total, 1)} />
            <Bar label="Blocked" value={taskStats.blocked} display={taskStats.blocked} color="bg-orange-400" max={Math.max(taskStats.total, 1)} />
          </div>
        </Section>

        <Section title="Status legend">
          <ul className="space-y-2.5">
            {BOOKING_STATUSES.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 text-sm text-stone-600">
                <span className={`w-3 h-3 rounded-full ${statusById(s.id).dot}`} /> {s.label}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
