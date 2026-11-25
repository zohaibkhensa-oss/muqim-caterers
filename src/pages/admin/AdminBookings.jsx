import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core'
import { format } from 'date-fns'
import { Kanban, List, Users, MapPin } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { BOOKING_STATUSES, fmtINR, packageById } from '@/data/mock'
import { moveBooking } from '@/features/bookings/bookingsSlice'

function BookingCard({ booking, dragging = false }) {
  return (
    <div
      className={`bg-white rounded-xl border border-stone-200 p-3.5 shadow-sm ${
        dragging ? 'shadow-xl rotate-2 cursor-grabbing' : 'cursor-grab hover:border-teal-300'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-teal-700">{booking.ref}</span>
        <span className="text-[11px] text-stone-400">{format(new Date(booking.date), 'd MMM')}</span>
      </div>
      <p className="text-sm font-medium text-stone-800 leading-snug">{booking.client.name}</p>
      <p className="text-xs text-stone-500 mt-0.5">{booking.eventType} · {packageById(booking.packageId)?.name ?? 'Custom'}</p>
      <div className="flex items-center justify-between mt-2.5 text-xs text-stone-500">
        <span className="inline-flex items-center gap-1"><Users size={12} /> {booking.guests}</span>
        {booking.amount != null && <span className="font-semibold text-teal-700">{fmtINR(booking.amount)}</span>}
      </div>
    </div>
  )
}

function DraggableCard({ booking }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: booking.id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? 'opacity-30' : ''}>
      <BookingCard booking={booking} />
    </div>
  )
}

function Column({ status, bookings }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3 w-64 shrink-0 transition-colors ${isOver ? 'bg-teal-100' : 'bg-stone-100'}`}
    >
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
        <span className="text-xs text-stone-400 font-medium">{bookings.length}</span>
      </div>
      <div className="space-y-2.5 min-h-[60px]">
        {bookings.map((b) => <DraggableCard key={b.id} booking={b} />)}
      </div>
    </div>
  )
}

export default function AdminBookings() {
  const bookings = useSelector((s) => s.bookings.list)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [view, setView] = useState('board')
  const [active, setActive] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = (e) => {
    setActive(null)
    const status = e.over?.id
    if (status) dispatch(moveBooking({ id: e.active.id, status }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-stone-500">
          {bookings.filter((b) => b.status !== 'done').length} open · drag cards to move stages
        </p>
        <div className="flex rounded-lg border border-stone-200 bg-white p-0.5">
          {[
            { id: 'board', icon: Kanban, label: 'Board' },
            { id: 'list', icon: List, label: 'List' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                view === v.id ? 'bg-teal-700 text-cream-50' : 'text-stone-500'
              }`}
            >
              <v.icon size={14} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'board' ? (
        <DndContext
          sensors={sensors}
          onDragStart={(e) => setActive(bookings.find((b) => b.id === e.active.id))}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActive(null)}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {BOOKING_STATUSES.map((s) => (
              <Column key={s.id} status={s} bookings={bookings.filter((b) => b.status === s.id)} />
            ))}
          </div>
          <DragOverlay>
            {active ? (
              <div onClick={() => navigate(`/admin/bookings/${active.id}`)}>
                <BookingCard booking={active} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-400 uppercase tracking-wide border-b border-stone-100">
                <th className="px-5 py-3">Ref</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Venue</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => navigate(`/admin/bookings/${b.id}`)}
                  className="hover:bg-stone-50 cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-semibold text-teal-700">{b.ref}</td>
                  <td className="px-5 py-3.5">{b.client.name}</td>
                  <td className="px-5 py-3.5 text-stone-600">
                    {b.eventType} · {format(new Date(b.date), 'd MMM, h a')}
                    <span className="text-stone-400"> · {b.guests} guests</span>
                  </td>
                  <td className="px-5 py-3.5 text-stone-600">
                    <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-stone-400" />{b.venue}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{b.amount != null ? fmtINR(b.amount) : '—'}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
