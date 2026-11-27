import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { fmtINR } from '@/data/mock'
import { useT } from '@/lib/i18n'

export default function PackageCard({ pkg, linkTo = true }) {
  const t = useT()
  const card = (
    <div className="group bg-white rounded-2xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className={`h-40 bg-gradient-to-br ${pkg.gradient} relative`}>
        <span className="absolute top-3 left-3 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
          {pkg.badge ?? pkg.category}
        </span>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="font-display text-xl font-semibold leading-tight">{pkg.name}</h3>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm text-stone-500 line-clamp-2 mb-3">{pkg.tagline}</p>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-teal-800">
              {fmtINR(pkg.pricePerHead)}<span className="text-xs font-normal text-stone-500">{t(' /head')}</span>
            </p>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <Users size={12} /> {t('min')} {pkg.minGuests}
            </p>
          </div>
          {linkTo && (
            <span className="w-9 h-9 rounded-full border border-teal-200 text-teal-700 grid place-items-center group-hover:bg-teal-700 group-hover:text-cream-50 transition-colors">
              <ArrowRight size={16} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
  return linkTo ? <Link to={`/packages/${pkg.id}`} className="block h-full">{card}</Link> : card
}
