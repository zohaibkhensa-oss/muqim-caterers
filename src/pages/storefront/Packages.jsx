import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PackageCard from '@/components/PackageCard'
import { useT } from '@/lib/i18n'

export default function Packages() {
  const t = useT()
  const packages = useSelector((s) => s.packages.list)
    .filter((p) => p.active)
    .sort((a, b) => a.tier - b.tier)

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <h1 className="font-display text-4xl font-semibold text-teal-900">{t('Packages')}</h1>
      <p className="text-stone-500 mt-2 mb-3 max-w-2xl">
        {t('Three tried-and-tested spreads. Every package includes service staff and crockery — and every dish is your pick from our')}{' '}
        <Link to="/menu" className="text-teal-700 font-semibold underline underline-offset-2">
          {t('full menu')}
        </Link>
        .
      </p>
      <p className="text-stone-500 mb-10 text-sm">
        {t('Semi catering, full catering, events and theme parties — we do them all.')}
      </p>

      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {packages.map((p) => <PackageCard key={p.id} pkg={p} />)}
      </div>

      <div className="mt-12 bg-white rounded-2xl border border-cream-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold text-teal-900">{t('Need something different?')}</h3>
          <p className="text-sm text-stone-500 mt-1">
            {t("Theme parties, live counters, custom menus, outdoor setups — tell us the occasion and we'll design it.")}
          </p>
        </div>
        <Link
          to="/book"
          className="inline-flex items-center gap-2 rounded-full bg-teal-700 text-cream-50 font-semibold px-6 py-3 hover:bg-teal-600 shrink-0"
        >
          {t('Request custom quote')} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
