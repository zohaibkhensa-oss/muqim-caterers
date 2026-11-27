import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { addBooking } from '@/features/bookings/bookingsSlice'
import { EVENT_TYPES, fmtINR, PACKAGE_PICKS, CONTACT } from '@/data/mock'
import { ALL_DISHES, waLink } from '@/lib/procurement'
import { useT } from '@/lib/i18n'

const input = 'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400'
const label = 'block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1'

// Auto-cycling slide card — swap `slides` for real photo URLs later.
function SlideShow({ title, slides }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 3200)
    return () => clearInterval(id)
  }, [slides.length])
  const s = slides[i]
  return (
    <div className={`relative rounded-2xl overflow-hidden h-36 md:h-44 flex-1 min-w-[140px] ${s.bg}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        <p className="font-display text-lg md:text-xl font-semibold text-cream-50 drop-shadow">{s.text}</p>
        <p className="text-[10px] uppercase tracking-widest text-cream-200/80 mt-1">{title}</p>
      </div>
    </div>
  )
}

// "Select N items" dropdown inside a package card.
function PickRow({ pick, dishes, setForm, onPick, t }) {
  const [open, setOpen] = useState(false)
  const pool = ALL_DISHES.filter((d) => pick.sections.includes(d.section))
  const picked = dishes.filter((d) => pick.sections.includes(d.section))
  const full = picked.length >= pick.count

  const toggle = (d) => {
    const on = dishes.some((x) => x.dish === d.dish)
    if (!on && full) return
    onPick()
    setForm((f) => ({
      ...f,
      dishes: on ? f.dishes.filter((x) => x.dish !== d.dish) : [...f.dishes, d],
    }))
  }

  return (
    <div className="border-t border-cream-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-cream-50"
      >
        <span className="text-[11px] font-semibold text-teal-900 truncate">+ {t(pick.label)}</span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${full ? 'bg-teal-700 text-cream-50' : 'bg-gold-300/50 text-teal-900'}`}>
            {picked.length}/{pick.count}
          </span>
          <ChevronDown size={12} className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div className="px-2 pb-2">
          <div className="max-h-40 overflow-y-auto space-y-0.5">
            {pool.map((d) => {
              const on = dishes.some((x) => x.dish === d.dish)
              const blocked = !on && full
              return (
                <button
                  key={d.dish} type="button" disabled={blocked} onClick={() => toggle(d)}
                  className={`w-full flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] font-medium ${
                    on ? 'bg-teal-700 text-cream-50'
                    : blocked ? 'text-stone-300 cursor-not-allowed'
                    : 'text-stone-600 hover:bg-cream-100'
                  }`}
                >
                  <span className={`w-3 h-3 rounded border grid place-items-center text-[8px] shrink-0 ${on ? 'bg-cream-50 border-cream-50 text-teal-800' : 'border-stone-300'}`}>
                    {on ? '✓' : ''}
                  </span>
                  {d.dish}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function PackageCard({ pkg, picks, active, onSelect, dishes, setForm, t }) {
  return (
    <div
      onClick={onSelect}
      className={`w-60 shrink-0 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all bg-white ${
        active ? 'border-teal-600 shadow-lg shadow-teal-900/10' : 'border-cream-200 hover:border-teal-300'
      }`}
    >
      <div className={`px-3 py-3 ${active ? 'bg-teal-700 text-cream-50' : 'bg-gradient-to-br ' + pkg.gradient + ' text-white'}`}>
        <p className="font-display font-semibold leading-tight">{pkg.name}</p>
        <p className="text-[11px] opacity-85 mt-0.5">
          {fmtINR(pkg.pricePerHead)}{t(' /head')} · {t('min')} {pkg.minGuests} {t('pax')}
        </p>
      </div>
      <div>
        {picks.map((pick) => (
          <PickRow key={pick.label} pick={pick} dishes={dishes} setForm={setForm} onPick={onSelect} t={t} />
        ))}
      </div>
    </div>
  )
}

export default function BookFlow() {
  const t = useT()
  const [params] = useSearchParams()
  const packages = useSelector((s) => s.packages.list.filter((p) => p.active))
  const allBookings = useSelector((s) => s.bookings.list)
  const dispatch = useDispatch()

  const [done, setDone] = useState(null)
  const [customMode, setCustomMode] = useState(false)
  const [activeCat, setActiveCat] = useState(3)
  const [form, setForm] = useState({
    name: '', phone: '', date: '', guests: 50, vegGuests: '', venue: '',
    eventType: 'Wedding', cateringType: 'full',
    packageId: params.get('package') ?? '', customMenu: '', dishes: [],
  })

  const pkg = packages.find((p) => p.id === form.packageId)
  const canSubmit = form.name.trim() && form.phone.trim() && form.date && form.guests > 0 && (form.packageId || form.customMenu.trim() || form.dishes.length)

  const slideshowA = [
    { text: t('Live Kebab Counter'), bg: 'bg-gradient-to-br from-teal-800 to-teal-950' },
    { text: t('Biryani Handi'), bg: 'bg-gradient-to-br from-gold-500 to-amber-700' },
    { text: t('Chaat Counter'), bg: 'bg-gradient-to-br from-teal-700 to-teal-900' },
    { text: t('Wedding Buffet'), bg: 'bg-gradient-to-br from-amber-600 to-teal-950' },
  ]
  const slideshowB = [
    { text: t('Dessert Counter'), bg: 'bg-gradient-to-br from-amber-500 to-gold-600' },
    { text: t('Mocktail Bar'), bg: 'bg-gradient-to-br from-teal-900 to-teal-700' },
    { text: t('Tandoor Station'), bg: 'bg-gradient-to-br from-teal-950 to-amber-800' },
    { text: t('Fruit & Salad Bar'), bg: 'bg-gradient-to-br from-gold-600 to-teal-800' },
  ]

  const toggleDish = (d) =>
    setForm((f) => ({
      ...f,
      dishes: f.dishes.some((x) => x.dish === d.dish)
        ? f.dishes.filter((x) => x.dish !== d.dish)
        : [...f.dishes, d],
    }))

  const submit = () => {
    const date = new Date(`${form.date}T12:00`).toISOString()
    const veg = Number(form.vegGuests || 0)
    const booking = {
      client: { name: form.name.trim(), phone: form.phone.trim(), email: '' },
      eventType: form.eventType,
      cateringType: form.cateringType,
      date,
      guests: Number(form.guests),
      pax: { veg, nonVeg: Math.max(Number(form.guests) - veg, 0) },
      venue: form.venue.trim(),
      packageId: form.packageId || null,
      amount: pkg ? pkg.pricePerHead * Number(form.guests || 0) : null,
      menuItems: form.dishes.map((d) => ({ dish: d.dish, group: d.group, requested: true })),
      notes: [
        ...(form.customMenu.trim() ? [`Custom menu request: ${form.customMenu.trim()}`] : []),
        ...(form.dishes.length ? [`Customer picked ${form.dishes.length} dishes — requests, not yet approved`] : []),
      ],
    }
    dispatch(addBooking(booking, allBookings))
    const max = allBookings.reduce((m, b) => Math.max(m, parseInt(b.ref.split('-')[1], 10) || 0), 2400)
    setDone({ ref: `MQ-${max + 1}` })
  }

  const menuText = useMemo(() => [
    `*${t('Menu request')} — Muqim Caterers*`,
    `${form.name || '—'} · ${form.guests} ${t('pax')} · ${form.date || '—'}`,
    pkg ? pkg.name : t('Custom request'), '',
    ...form.dishes.map((d) => `• ${d.dish}`),
  ].join('\n'), [form, pkg, t])

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle2 size={56} className="mx-auto text-teal-600 mb-6" />
        <h1 className="font-display text-3xl font-semibold text-teal-900">{t('Inquiry received!')}</h1>
        <p className="text-stone-500 mt-3">{t('Our team will call you within 24 hours with a quote. Save your reference:')}</p>
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

  const pickLabels = pkg ? (PACKAGE_PICKS[pkg.id] ?? []) : []
  const groupDefs = pkg ? pickLabels : CUSTOM_CATEGORIES
  const grouped = groupDefs.map((p) => ({
    label: p.label,
    items: form.dishes.filter((d) => d.section === p.label || p.sections?.includes(d.section)),
  })).filter((g) => g.items.length)
  const ungrouped = form.dishes.filter((d) => !grouped.some((g) => g.items.includes(d)))

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 md:py-8">
      {/* ── Top strip: slideshows flanking the logo ── */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
        <img src="/logo.jpeg" alt="Muqim Caterer's" className="h-32 md:h-44 w-auto mx-auto rounded-2xl bg-white object-contain shrink-0 shadow-sm sm:order-none order-first" />
        <div className="flex gap-3 flex-1 min-w-0">
          <SlideShow title={t('Catering photos')} slides={slideshowA} />
          <SlideShow title={t('Counter photos')} slides={slideshowB} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ── Left: preview of menu selected ── */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border-2 border-gold-400/60 overflow-hidden shadow-sm">
            <div className="bg-teal-950 text-cream-50 px-4 py-3 text-center relative">
              <img src="/logo.jpeg" alt="" className="absolute inset-0 m-auto h-full opacity-15 object-contain" />
              <p className="relative font-display font-semibold text-sm tracking-wide">{t('Preview of menu selected')}</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className={label}>{t('Name')}</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('Full name')} className={input} />
                </div>
                <div>
                  <span className={label}>{t('Mobile')}</span>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" className={input} />
                </div>
                <div>
                  <span className={label}>{t('Pax')}</span>
                  <input type="number" min="10" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className={input} />
                </div>
                <div>
                  <span className={label}>{t('Date')}</span>
                  <input type="date" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} className={input} />
                </div>
                <div className="col-span-2">
                  <span className={label}>{t('Event')}</span>
                  <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className={input}>
                    {EVENT_TYPES.map((ev) => <option key={ev} value={ev}>{t(ev)}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <span className={label}>{t('Venue / area')}</span>
                  <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder={t('e.g. City Banquets, Gomti Nagar')} className={input} />
                </div>
              </div>

              <div className="border-t border-dashed border-cream-300 pt-3 min-h-[80px]">
                {form.dishes.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4">
                    {t('Pick a package and select dishes — your menu card appears here.')}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {grouped.map((g) => (
                      <div key={g.label}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600">{t(g.label)}</p>
                        <p className="text-xs text-stone-600 leading-relaxed">{g.items.map((d) => d.dish).join(' · ')}</p>
                      </div>
                    ))}
                    {ungrouped.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600">{t('Selected dishes')}</p>
                        <p className="text-xs text-stone-600 leading-relaxed">{ungrouped.map((d) => d.dish).join(' · ')}</p>
                      </div>
                    )}
                    <p className="text-[11px] text-teal-700 font-semibold">{form.dishes.length} {t('dishes selected')}</p>
                  </div>
                )}
              </div>

              {pkg && (
                <p className="text-xs bg-gold-300/30 border border-gold-400/40 rounded-lg px-3 py-2 text-teal-900">
                  {pkg.name} · {t('Rough estimate for')} {form.guests} {t('guests:')} <strong>{fmtINR(pkg.pricePerHead * Number(form.guests || 0))}</strong>
                </p>
              )}

              <div className="space-y-2 pt-1">
                {form.dishes.length > 0 && (
                  <a
                    href={waLink(CONTACT.phones[0], menuText)}
                    target="_blank" rel="noreferrer"
                    className="block text-center rounded-lg bg-red-600 text-white px-4 py-2.5 text-xs font-bold tracking-wide hover:bg-red-700"
                  >
                    {t('SAVE — Get your menu on WhatsApp')}
                  </a>
                )}
                <button
                  onClick={submit} disabled={!canSubmit}
                  className="w-full rounded-lg bg-gold-500 text-teal-950 px-4 py-2.5 text-sm font-bold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('Submit inquiry')}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right: package cards row ── */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-600 mb-3">{t('Pick a package — select dishes per category')}</p>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {packages.map((p) => (
              <PackageCard
                key={p.id}
                pkg={p}
                picks={PACKAGE_PICKS[p.id] ?? []}
                active={form.packageId === p.id}
                onSelect={() => setForm((f) => ({ ...f, packageId: f.packageId === p.id ? '' : p.id }))}
                dishes={form.dishes}
                setForm={setForm}
                t={t}
              />
            ))}
          </div>

          {/* ── Red custom-menu button ── */}
          <button
            onClick={() => setCustomMode(!customMode)}
            className="mt-4 w-full rounded-xl bg-red-600 text-white font-display font-semibold text-base md:text-lg py-4 tracking-wide hover:bg-red-700 transition-colors"
          >
            {t('If you wish to customise your menu — tap here')}
          </button>

          {customMode && (
            <div className="mt-4 flex flex-col xl:flex-row gap-4 items-start">
              {/* Center — dish checklist for the active category */}
              <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-cream-200 p-4 md:p-5">
                <h3 className="font-display text-xl font-semibold text-red-600 text-center uppercase tracking-wide">
                  {t(CUSTOM_CATEGORIES[activeCat].label)}
                </h3>
                <p className="text-[11px] text-stone-400 text-center mb-4">
                  {t('Tick the items as selection — they appear in the preview on the left')}
                </p>
                <div className="columns-1 sm:columns-2 2xl:columns-3 gap-x-6">
                  {groupsForCategory(CUSTOM_CATEGORIES[activeCat]).map((g) => (
                    <div key={g.title} className="break-inside-avoid mb-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 border-b border-teal-100 pb-1 mb-1.5">
                        {t(g.title)}
                      </p>
                      {g.items.map((d) => {
                        const on = form.dishes.some((x) => x.dish === d.dish)
                        return (
                          <button
                            key={d.dish} type="button" onClick={() => toggleDish(d)}
                            className={`w-full flex items-center gap-2 rounded px-1.5 py-1 text-left text-[13px] transition-colors ${
                              on ? 'text-teal-800 font-semibold bg-teal-50' : 'text-stone-600 hover:bg-cream-50'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-sm border grid place-items-center text-[9px] shrink-0 ${on ? 'bg-teal-600 border-teal-600 text-white' : 'border-stone-300 bg-white'}`}>
                              {on ? '✓' : ''}
                            </span>
                            • {d.dish}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-2 border-t border-cream-200 pt-4">
                  <label className={label}>{t('Or describe your own menu / requirements')}</label>
                  <textarea
                    value={form.customMenu}
                    onChange={(e) => setForm({ ...form, customMenu: e.target.value })}
                    rows={2}
                    placeholder={t('e.g. Vegetarian only, live chaat counter, Jain options for 20 guests…')}
                    className={input}
                  />
                </div>
              </div>

              {/* Right — Customize category list */}
              <div className="w-full xl:w-52 shrink-0 bg-white rounded-2xl border border-cream-200 p-4 h-fit xl:sticky xl:top-24">
                <h3 className="font-display text-lg font-semibold text-red-600 text-center">{t('Customize')}</h3>
                <p className="text-[11px] text-stone-400 text-center mb-3">{t('Select elements to choose dishes')}</p>
                <div className="flex xl:flex-col gap-1 overflow-x-auto">
                  {CUSTOM_CATEGORIES.map((c, i) => (
                    <button
                      key={c.label}
                      onClick={() => setActiveCat(i)}
                      className={`text-left rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                        activeCat === i ? 'font-bold text-teal-900 bg-teal-50' : 'text-stone-500 hover:bg-cream-50'
                      }`}
                    >
                      {t(c.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {customMode && (
            <p className="mt-4 rounded-xl bg-red-600 text-white text-center font-semibold text-sm md:text-base py-3.5 px-4">
              {t('Our team will connect to you for exact quotation — or call on')} {CONTACT.phones[1]}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
