import { statusById } from '@/data/mock'
import { useT } from '@/lib/i18n'

export default function StatusBadge({ status }) {
  const t = useT()
  const s = statusById(status)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {t(s.label)}
    </span>
  )
}
