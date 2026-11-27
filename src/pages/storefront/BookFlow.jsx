import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, CalendarDays, UtensilsCrossed, User, ClipboardCheck, Search } from 'lucide-react'
import { addBooking } from '@/features/bookings/bookingsSlice'
import { EVENT_TYPES, CATERING_TYPES, fmtINR } from '@/data/mock'
import { ALL_DISHES } from '@/lib/procurement'
import { useT } from '@/lib/i18n'

const STEPS = [
  { id: 'event', label: 'Event', icon: CalendarDays },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'contact', label: 'Contact', icon: User },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
]

const input = 'w-full rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-400'
const label = 'block text-sm font-medium text-stone-600 mb-1.5'

export default function BookFlow() {
  const t = useT()
  const [params] = useSearchParams()
  const packages = useSelector((s) => s.packages.list.filter((p) => p.active))
  const allBookings = useSelector((s) => s.bookings.list)
  const dispatch = useDispatch()

  const [step, setStep] = useState(0)
  const [done, setDone] = useState(null)
  const [form, setForm] = useState({
    eventType: '', cateringType: 'full', date: '', time: '', guests: 50, vegGuests: '', venue: '',
    packageId: params.get('package') ?? '', customMenu: '', dishes: [],
    name: '', phone: '', email: '', notes: '',
  })
  const [dishQuery, setDishQuery] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }))

  const pkg = packages.find((p) => p.id === form.packageId)
  const estimate = useMemo(
    () => (pkg ? pkg.pricePerHead * Number(form.guests || 0) : null),
    [pkg, form.guests]
  )

  const canNext = [
    form.eventType && form.date && form.guests > 0 && form.venue.trim(),
    form.packageId || form.customMenu.trim(),
    form.name.trim() && form.phone.trim(),
    true,
  ][step]

  const submit = () => {
    const date = new Date(`${form.date}T${form.time || '12:00'}`).toISOString()
    const veg = Number(form.vegGuests || 0)
    const booking = {
      client: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() },
      eventType: form.eventType,
      cateringType: form.cateringType,
      date,
      guests: Number(form.guests),
      pax: { veg, nonVeg: Math.max(Number(form.guests) - veg, 0) },
      venue: form.venue.trim(),
      packageId: form.packageId || null,
      amount: estimate,
      menuItems: form.dishes.map((d) => ({ dish: d.dish, group: d.group, requested: true })),
      notes: [
        ...(form.customMenu.trim() ? [`Custom menu request: ${form.customMenu.trim()}`] : []),
        ...(form.dishes.length ? [`Customer picked ${form.dishes.length} dishes — requests, not yet approved`] : []),
        ...(form.notes.trim() ? [form.notes.trim()] : []),
      ],
    }
    dispatch(addBooking(booking, allBookings))
    // prepare() runs before we can read the ref back — recompute the same ref
    const max = allBookings.reduce((m, b) => Math.max(m, parseInt(b.ref.split('-')[1], 10) || 0), 2400)
    setDone({ ref: `MQ-${max + 1}` })
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle2 size={56} className="mx-auto text-teal-600 mb-6" />
        <h1 className="font-display text-3xl font-semibold text-teal-900">{t('Inquiry received!')}</h1>
        <p className="text-stone-500 mt-3">
          {t('Our team will call you within 24 hours with a quote. Save your reference:')}
        </p>
        <p className="mt-6 inline-block rounded-2xl bg-teal-50 border border-teal-200 px-8 py-4 font-display text-3xl font-semibold text-teal-800 tracking-wider">
          {done.ref}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to={`/booking/${done.ref}`} className="rounded-full bg-teal-700 text-cream-50 px-6 py-3 font-semibold hover:bg-teal-600">
            {t('Track status')}
          </Link>
          <Link to="/" className="rounded-full border border-cream-200 px-6 py-3 font-semibold text-stone-600 hover:border-teal-300">
            {t('Back home')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-teal-900 text-center">{t('Book your event')}</h1>
      <p className="text-stone-500 text-center mt-2 mb-10">{t('Two minutes now — a quote within 24 hours.')}</p>

      <div className="flex justify-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className={`w-9 h-9 rounded-full grid place-items-center text-sm font-semibold transition-colors ${
                i < step ? 'bg-teal-600 text-cream-50'
                : i === step ? 'bg-teal-700 text-cream-50 ring-4 ring-teal-100'
                : 'bg-cream-200 text-stone-500'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </span>
            <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-teal-800' : 'text-stone-400'}`}>
              {t(s.label)}
            </span>
            {i < STEPS.length - 1 && <span className="w-8 h-px bg-cream-300 mx-1" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl border border-cream-200 p-6 md:p-8"
        >
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <span className={label}>{t('What are we catering?')}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TYPES.map((ev) => (
                    <button
                      key={ev}
                      onClick={() => set('eventType')(ev)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        form.eventType === ev
                          ? 'border-teal-600 bg-teal-50 text-teal-800'
                          : 'border-cream-200 text-stone-600 hover:border-teal-300'
                      }`}
                    >
                      {t(ev)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={label}>{t('Event date')}</label>
                  <input type="date" value={form.date} onChange={set('date')} className={input} min={new Date().toISOString().slice(0, 10)} />
                </div>
                <div>
                  <label className={label}>{t('Time')}</label>
                  <input type="time" value={form.time} onChange={set('time')} className={input} />
                </div>
              </div>
              <div>
                <span className={label}>{t('Catering type')}</span>
                <div className="grid sm:grid-cols-3 gap-2">
                  {CATERING_TYPES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => set('cateringType')(c.id)}
                      className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                        form.cateringType === c.id
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-cream-200 hover:border-teal-300'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${form.cateringType === c.id ? 'text-teal-800' : 'text-stone-700'}`}>
                        {t(c.label)}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">{t(c.desc)}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label className={label}>{t('Total guests *')}</label>
                  <input type="number" min="10" value={form.guests} onChange={set('guests')} className={input} />
                </div>
                <div>
                  <label className={label}>{t('Veg guests (approx)')}</label>
                  <input
                    type="number" min="0" max={form.guests}
                    value={form.vegGuests}
                    onChange={set('vegGuests')}
                    placeholder="e.g. 60"
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>{t('Non-veg guests')}</label>
                  <input
                    value={Math.max(Number(form.guests) - Number(form.vegGuests || 0), 0)}
                    readOnly
                    className={`${input} bg-cream-50 text-stone-500`}
                  />
                </div>
              </div>
              <div>
                <label className={label}>{t('Venue / area')}</label>
                <input value={form.venue} onChange={set('venue')} placeholder={t('e.g. City Banquets, Gomti Nagar')} className={input} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <span className={label}>{t('Pick a package (or go custom below)')}</span>
              <div className="grid sm:grid-cols-2 gap-3">
                {packages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setForm((f) => ({ ...f, packageId: f.packageId === p.id ? '' : p.id }))}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      form.packageId === p.id
                        ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                        : 'border-cream-200 hover:border-teal-300'
                    }`}
                  >
                    <p className="font-semibold text-sm text-teal-900">{p.name}</p>
                    <p className="text-xs text-stone-500 mt-1">{fmtINR(p.pricePerHead)}{t(' /head')} · {t('min')} {p.minGuests}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className={label}>{t('Or describe your own menu / requirements')}</label>
                <textarea
                  value={form.customMenu}
                  onChange={set('customMenu')}
                  rows={3}
                  placeholder={t('e.g. Vegetarian only, live chaat counter, Jain options for 20 guests…')}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>{t('Pick specific dishes (optional — requests, we confirm the final menu)')}</label>
                <div className="rounded-xl border border-cream-200 p-3">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      value={dishQuery} onChange={(e) => setDishQuery(e.target.value)}
                      placeholder={t('Search the full menu — e.g. galouti, biryani, phirni…')}
                      className="w-full rounded-lg border border-cream-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-teal-400"
                    />
                  </div>
                  {form.dishes.length > 0 && (
                    <p className="text-xs text-teal-800 bg-teal-50 rounded-lg px-3 py-2 mb-2">
                      {form.dishes.length} {t('dishes selected')}
                    </p>
                  )}
                  <div className="max-h-56 overflow-y-auto flex flex-wrap gap-1.5">
                    {ALL_DISHES
                      .filter((d) => !dishQuery || d.dish.toLowerCase().includes(dishQuery.toLowerCase()))
                      .slice(0, 120)
                      .map((d) => {
                        const on = form.dishes.some((x) => x.dish === d.dish)
                        return (
                          <button
                            key={d.dish}
                            type="button"
                            onClick={() => setForm((f) => ({
                              ...f,
                              dishes: on ? f.dishes.filter((x) => x.dish !== d.dish) : [...f.dishes, d],
                            }))}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                              on ? 'bg-teal-700 text-cream-50' : 'bg-cream-100 text-stone-600 hover:bg-teal-50 hover:text-teal-800'
                            }`}
                          >
                            {d.dish}
                          </button>
                        )
                      })}
                  </div>
                </div>
              </div>
              {estimate != null && (
                <p className="text-sm bg-gold-300/30 border border-gold-400/40 rounded-xl px-4 py-3 text-teal-900">
                  {t('Rough estimate for')} {form.guests} {t('guests:')} <strong>{fmtINR(estimate)}</strong> {t('(final quote may vary)')}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={label}>{t('Your name *')}</label>
                  <input value={form.name} onChange={set('name')} placeholder={t('Full name')} className={input} />
                </div>
                <div>
                  <label className={label}>{t('Phone *')}</label>
                  <input value={form.phone} onChange={set('phone')} placeholder="+91 …" className={input} />
                </div>
              </div>
              <div>
                <label className={label}>{t('Email (optional)')}</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={input} />
              </div>
              <div>
                <label className={label}>{t('Anything else we should know?')}</label>
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder={t('Parking, floor, timings, dietary needs…')} className={input} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-display text-xl font-semibold text-teal-900 mb-5">{t('Review your inquiry')}</h3>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {[
                  [t('Event'), t(form.eventType)],
                  [t('Catering type'), t(CATERING_TYPES.find((c) => c.id === form.cateringType)?.label)],
                  [t('Date'), `${form.date}${form.time ? ` · ${form.time}` : ''}`],
                  [t('Guests'), `${form.guests}${form.vegGuests ? ` (${form.vegGuests} ${t('veg')} · ${Math.max(Number(form.guests) - Number(form.vegGuests), 0)} ${t('non-veg')})` : ''}`],
                  [t('Venue'), form.venue],
                  [t('Menu'), `${pkg ? pkg.name : t('Custom request')}${form.dishes.length ? ` · ${form.dishes.length} ${t('dishes picked')}` : ''}`],
                  [t('Contact'), `${form.name} · ${form.phone}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-stone-400 text-xs uppercase tracking-wide">{k}</dt>
                    <dd className="font-medium text-stone-800 mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
              {estimate != null && (
                <p className="mt-6 text-sm bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-teal-900">
                  {t('Estimated total:')} <strong className="text-lg">{fmtINR(estimate)}</strong>
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-stone-600 disabled:opacity-30 hover:text-teal-700"
        >
          <ArrowLeft size={16} /> {t('Back')}
        </button>
        {step < 3 ? (
          <button
            onClick={() => canNext && setStep((s) => s + 1)}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 text-cream-50 px-6 py-3 text-sm font-semibold hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('Continue')} <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 text-teal-950 px-7 py-3 text-sm font-bold hover:bg-gold-400"
          >
            {t('Submit inquiry')} <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
