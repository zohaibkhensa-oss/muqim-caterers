import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fmtINR } from '@/data/mock'

export default function AdminClients() {
  const clients = useSelector((s) => s.clients.list)
  const bookings = useSelector((s) => s.bookings.list)
  const navigate = useNavigate()

  const rows = clients.map((c) => {
    const their = bookings.filter((b) => b.client.name === c.name || b.client.phone === c.phone)
    return {
      ...c,
      events: their.length,
      spent: their.reduce((sum, b) => (b.status === 'done' ? sum + (b.amount ?? 0) : sum), 0),
      last: their.length ? their.reduce((a, b) => (new Date(b.date) > new Date(a.date) ? b : a)) : null,
      bookings: their,
    }
  }).sort((a, b) => b.spent - a.spent)

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-left text-xs text-stone-400 uppercase tracking-wide border-b border-stone-100">
            <th className="px-5 py-3">Client</th>
            <th className="px-5 py-3">Contact</th>
            <th className="px-5 py-3">Events</th>
            <th className="px-5 py-3">Total billed</th>
            <th className="px-5 py-3">Last event</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-stone-50">
              <td className="px-5 py-3.5">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-stone-400">client since {format(new Date(c.since), 'MMM yyyy')}</p>
              </td>
              <td className="px-5 py-3.5 text-stone-600">
                <p>{c.phone}</p>
                <p className="text-xs text-stone-400">{c.email}</p>
              </td>
              <td className="px-5 py-3.5">{c.events}</td>
              <td className="px-5 py-3.5 font-medium">{c.spent ? fmtINR(c.spent) : '—'}</td>
              <td className="px-5 py-3.5 text-stone-600">
                {c.last ? (
                  <button onClick={() => navigate(`/admin/bookings/${c.last.id}`)} className="text-teal-700 hover:underline">
                    {format(new Date(c.last.date), 'd MMM yyyy')} · {c.last.ref}
                  </button>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
