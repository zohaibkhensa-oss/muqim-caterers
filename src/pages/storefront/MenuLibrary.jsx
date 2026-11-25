import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, ArrowRight } from 'lucide-react'
import { MENU_LIBRARY } from '@/data/mock'

export default function MenuLibrary() {
  const [q, setQ] = useState('')

  const sections = MENU_LIBRARY
    .map((s) => ({
      ...s,
      items: q ? s.items.filter((i) => i.toLowerCase().includes(q.toLowerCase())) : s.items,
    }))
    .filter((s) => s.items.length > 0)

  const total = MENU_LIBRARY.reduce((n, s) => n + s.items.length, 0)

  return (
    <div>
      <div className="bg-teal-950 text-cream-50">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">The Muqim kitchen</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Full Menu</h1>
          <p className="mt-4 text-cream-200/85 max-w-xl mx-auto">
            {total}+ dishes — every package lets you pick within its counts.
            Zafraan Signature items are our house specialities.
          </p>
          <div className="relative max-w-md mx-auto mt-8">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes — biryani, kebab, kheer…"
              className="w-full rounded-full bg-white/10 border border-cream-50/20 text-cream-50 placeholder:text-cream-300/50 pl-11 pr-4 py-3 text-sm outline-none focus:border-gold-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-12">
        {sections.length ? sections.map((section) => {
          const signature = section.section.includes('Zafraan')
          return (
            <section key={section.section}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-display text-2xl font-semibold text-teal-900">{section.section}</h2>
                {signature && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-300/40 border border-gold-500/40 text-teal-900 px-3 py-0.5 text-xs font-bold">
                    <Star size={11} className="fill-gold-500 text-gold-500" /> House special
                  </span>
                )}
                <span className="text-xs text-stone-400 ml-auto">{section.items.length} dishes</span>
              </div>
              <div className={`rounded-2xl border p-5 md:p-6 ${signature ? 'bg-gradient-to-br from-gold-300/25 to-cream-100 border-gold-400/40' : 'bg-white border-cream-200'}`}>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-stone-700">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${signature ? 'bg-gold-500' : 'bg-teal-400'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )
        }) : (
          <p className="text-center text-stone-500 py-16">No dishes match “{q}”.</p>
        )}

        <div className="bg-teal-950 rounded-3xl p-8 md:p-10 text-cream-50 text-center">
          <h3 className="font-display text-2xl font-semibold mb-3">Found your favourites?</h3>
          <p className="text-cream-300/85 text-sm mb-6">
            Pick a package, then tell us which dishes you want — or build a fully custom menu.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/packages" className="rounded-full border border-cream-50/30 px-6 py-3 font-semibold hover:bg-cream-50/10">
              See packages
            </Link>
            <Link to="/book" className="inline-flex items-center gap-2 rounded-full bg-gold-500 text-teal-950 font-semibold px-6 py-3 hover:bg-gold-400">
              Book now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
