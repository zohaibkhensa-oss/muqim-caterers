import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  format, isSameMonth, isSameDay, isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { statusById } from '@/data/mock'

export default function AdminCalendar() {
  const bookings = useSelector((s) => s.bookings.list)
  const [month, setMonth] = useState(new Date())

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)

  const eventsOn = (day) => bookings.filter((b) => isSameDay(new Date(b.date), day))

  return (
    <div className="bg-white rounded-xl border border-stone-200">
      <header className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <h2 className="font-display text-lg font-semibold text-teal-900">{format(month, 'MMMM yyyy')}</h2>
        <div className="flex gap-1">
          <button onClick={() => setMonth(addMonths(month, -1))} className="p-2 rounded-lg hover:bg-stone-100"><ChevronLeft size={18} /></button>
          <button onClick={() => setMonth(new Date())} className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100">Today</button>
          <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 rounded-lg hover:bg-stone-100"><ChevronRight size={18} /></button>
        </div>
      </header>

      <div className="grid grid-cols-7 text-xs font-semibold text-stone-400 uppercase tracking-wide border-b border-stone-100">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="px-3 py-2.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const events = eventsOn(day)
          const inMonth = isSameMonth(day, month)
          return (
            <div
              key={i}
              className={`min-h-[110px] border-b border-r border-stone-100 p-2 [&:nth-child(7n)]:border-r-0 ${
                inMonth ? 'bg-white' : 'bg-stone-50'
              }`}
            >
              <span
                className={`inline-grid place-items-center w-7 h-7 rounded-full text-sm ${
                  isToday(day) ? 'bg-teal-700 text-cream-50 font-bold' : inMonth ? 'text-stone-700' : 'text-stone-300'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-1.5 space-y-1">
                {events.map((b) => (
                  <Link
                    key={b.id}
                    to={`/admin/bookings/${b.id}`}
                    className="block rounded-md bg-teal-50 border-l-2 px-2 py-1 text-[11px] leading-tight hover:bg-teal-100"
                    style={{ borderLeftColor: 'var(--tw-border-opacity, 1)' }}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusById(b.status).dot}`} />
                    <span className="font-medium text-teal-900">{b.client.name}</span>
                    <span className="block text-stone-500 truncate">{b.eventType} · {b.guests}p</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
