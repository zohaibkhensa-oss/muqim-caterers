import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Search, Loader2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { BOOKING_STATUSES, statusById, fmtINR, packageById, CONTACT } from '@/data/mock'
import { supabaseReady } from '@/lib/supabase'
import { lookupBookingByRef } from '@/lib/db'
import { useT } from '@/lib/i18n'

const input = 'w-full rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-400'

export default function BookingStatus() {
  const t = useT()
  const { ref: refParam } = useParams()
  const [ref, setRef] = useState(refParam ?? '')
  const [searched, setSearched] = useState('')
  const [remote, setRemote] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const localBooking = useSelector((s) => s.bookings.list.find((b) => b.ref === searched.trim().toUpperCase()))

  const lookup = async (code) => {
    const normalized = code.trim().toUpperCase()
    if (!normalized) return
    setSearched(normalized)
    if (!supabaseReady) return
    setBusy(true)
    setRemote(await lookupBookingByRef(normalized))
    setBusy(false)
  }

  useEffect(() => {
    if (refParam) lookup(refParam)
  }, [refParam]) // eslint-disable-line react-hooks/exhaustive-deps

  const booking = supabaseReady ? remote : localBooking
  const pkg = booking?.packageId ? packageById(booking.packageId) : null
  const currentIdx = booking ? BOOKING_STATUSES.findIndex((s) => s.id === booking.status) : -1

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-display text-4xl font-semibold text-teal-900 text-center">{t('Track your booking')}</h1>
      <p className="text-stone-500 text-center mt-2 mb-8">{t('Enter the reference code from your confirmation (e.g. MQ-2481).')}</p>

      <form
        onSubmit={(e) => { e.preventDefault(); lookup(ref) }}
        className="flex gap-2 max-w-md mx-auto"
      >
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="MQ-…" className={input} />
        <button className="rounded-xl bg-teal-700 text-cream-50 px-5 grid place-items-center hover:bg-teal-600">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </form>

      {searched && !busy && !booking && (
        <p className="text-center text-stone-500 mt-10">
          {t('No booking found for')} <strong>{searched}</strong>. {t('Check the code or')}{' '}
          <Link to="/book" className="text-teal-700 font-semibold">{t('start a new inquiry')}</Link>.
        </p>
      )}

      {booking && (
        <div className="mt-10 bg-white rounded-2xl border border-cream-200 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">{t('Reference')}</p>
              <p className="font-display text-2xl font-semibold text-teal-900">{booking.ref}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex items-center gap-1 mb-8">
            {BOOKING_STATUSES.map((s, i) => (
              <div key={s.id} className="flex-1">
                <div className={`h-1.5 rounded-full ${i <= currentIdx ? 'bg-teal-600' : 'bg-cream-200'}`} />
                <p className={`text-[10px] mt-1.5 text-center ${i <= currentIdx ? 'text-teal-700 font-semibold' : 'text-stone-400'}`}>
                  {t(s.label)}
                </p>
              </div>
            ))}
          </div>

          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-stone-400 text-xs uppercase">{t('Event')}</dt>
              <dd className="font-medium mt-0.5">
                {t(booking.eventType)} · {booking.guests} {t('guests')}
                {booking.pax?.veg ? ` (${booking.pax.veg} ${t('veg')})` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-stone-400 text-xs uppercase">{t('Date')}</dt>
              <dd className="font-medium mt-0.5">{format(new Date(booking.date), 'EEE, d MMM yyyy · h:mm a')}</dd>
            </div>
            <div>
              <dt className="text-stone-400 text-xs uppercase">{t('Venue')}</dt>
              <dd className="font-medium mt-0.5">{booking.venue}</dd>
            </div>
            <div>
              <dt className="text-stone-400 text-xs uppercase">{t('Menu')}</dt>
              <dd className="font-medium mt-0.5">{pkg ? pkg.name : t('Custom')}</dd>
            </div>
            {booking.amount != null && (
              <div>
                <dt className="text-stone-400 text-xs uppercase">{t('Estimated total')}</dt>
                <dd className="font-medium mt-0.5">{fmtINR(booking.amount)}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-400 text-xs uppercase">{t('Current stage')}</dt>
              <dd className="font-medium mt-0.5">{t(statusById(booking.status).label)}</dd>
            </div>
          </dl>

          <p className="text-xs text-stone-400 mt-6">
            {t('Questions? Call us at')} {CONTACT.phones[0]} {t('and mention')} {booking.ref}.
          </p>
        </div>
      )}
    </div>
  )
}
