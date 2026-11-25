export default function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">{label}</span>
        {Icon && <Icon size={18} className="text-teal-600" />}
      </div>
      <p className="text-2xl font-semibold text-teal-900">{value}</p>
      {sub && <p className="text-xs text-stone-500 mt-1">{sub}</p>}
    </div>
  )
}
