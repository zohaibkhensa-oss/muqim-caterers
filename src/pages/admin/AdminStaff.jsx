import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { format, compareAsc } from 'date-fns'
import { Phone } from 'lucide-react'

export default function AdminStaff() {
  const staff = useSelector((s) => s.staff.list)
  const bookings = useSelector((s) => s.bookings.list)

  const upcomingFor = (id) =>
    bookings
      .filter((b) => b.staffIds.includes(id) && new Date(b.date) >= new Date() && b.status !== 'done')
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.map((s) => {
        const upcoming = upcomingFor(s.id)
        return (
          <div key={s.id} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 grid place-items-center font-semibold">
                {s.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-stone-500">{s.role}</p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-sm text-stone-600 mb-4">
              <Phone size={14} className="text-teal-600" /> {s.phone}
            </p>
            <div className="border-t border-stone-100 pt-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                Upcoming ({upcoming.length})
              </p>
              {upcoming.length ? (
                <ul className="space-y-1.5">
                  {upcoming.map((b) => (
                    <li key={b.id}>
                      <Link to={`/admin/bookings/${b.id}`} className="text-sm text-teal-700 hover:underline">
                        {format(new Date(b.date), 'd MMM')} · {b.eventType} — {b.client.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-400">No upcoming assignments</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
