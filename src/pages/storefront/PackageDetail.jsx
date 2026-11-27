import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Check, Users, ArrowLeft, ArrowRight } from 'lucide-react'
import { fmtINR } from '@/data/mock'
import { useT } from '@/lib/i18n'

export default function PackageDetail() {
  const t = useT()
  const { id } = useParams()
  const pkg = useSelector((s) => s.packages.list.find((p) => p.id === id))

  if (!pkg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-teal-900 mb-4">{t('Package not found')}</h1>
        <Link to="/packages" className="text-teal-700 font-semibold">← {t('Back to packages')}</Link>
      </div>
    )
  }

  return (
    <div>
      <div className={`bg-gradient-to-br ${pkg.gradient} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-16">
          <Link to="/packages" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-6">
            <ArrowLeft size={15} /> {t('All packages')}
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">{pkg.category}</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-2">{pkg.name}</h1>
          <p className="mt-3 text-white/85 max-w-xl">{pkg.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {pkg.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-[1fr_320px] gap-10">
        <div>
          <h2 className="font-display text-2xl font-semibold text-teal-900 mb-5">{t('What\'s included')}</h2>
          <ul className="space-y-3">
            {pkg.items.map((item) => (
              <li key={item} className="flex gap-3 items-start bg-white rounded-xl border border-cream-200 p-4">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 grid place-items-center shrink-0 mt-0.5">
                  <Check size={14} />
                </span>
                <span className="text-sm text-stone-700">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-stone-500 mt-6">
            {t('Menus are starting points — swap dishes, add live counters, or go fully custom during booking.')}
          </p>
        </div>

        <aside className="bg-white rounded-2xl border border-cream-200 p-6 h-fit sticky top-24">
          <p className="text-3xl font-semibold text-teal-800">
            {fmtINR(pkg.pricePerHead)}
            <span className="text-sm font-normal text-stone-500">{t(' /guest')}</span>
          </p>
          <div className="mt-4 space-y-2 text-sm text-stone-600">
            <p className="flex items-center gap-2"><Users size={15} className="text-teal-600" /> {t('Minimum')} {pkg.minGuests} {t('guests')}</p>
            <p>{pkg.servesNote}</p>
          </div>
          <Link
            to={`/book?package=${pkg.id}`}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-teal-700 text-cream-50 font-semibold px-6 py-3 hover:bg-teal-600 transition-colors w-full"
          >
            {t('Book this package')} <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-stone-400 text-center mt-3">{t('Free quote · no payment needed to inquire')}</p>
        </aside>
      </div>
    </div>
  )
}
