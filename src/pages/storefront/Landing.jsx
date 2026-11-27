import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { CalendarCheck, UtensilsCrossed, PartyPopper, Star, ArrowRight, Quote } from 'lucide-react'
import PackageCard from '@/components/PackageCard'
import { useT } from '@/lib/i18n'

const steps = [
  { icon: CalendarCheck, title: 'Tell us about your event', text: 'Date, venue, headcount and the occasion — takes two minutes.' },
  { icon: UtensilsCrossed, title: 'Pick or build your menu', text: 'Choose a curated package or customize one with our team.' },
  { icon: PartyPopper, title: 'We handle the rest', text: 'Cooking, transport, setup, service — you enjoy the event.' },
]

export default function Landing() {
  const t = useT()
  const packages = useSelector((s) => s.packages.list).filter((p) => p.active).slice(0, 3)

  return (
    <div>
      <section className="relative overflow-hidden bg-teal-950 text-cream-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.18),transparent_55%)]" />
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 relative lg:flex lg:items-center lg:gap-16">
          <motion.div className="flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-gold-400 font-semibold tracking-wide text-sm uppercase mb-4">
              {t('Hazratganj, Lucknow · Semi & Full Catering · Events · Theme Parties')}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] max-w-3xl">
              {t('Real Lucknowi food,')} <span className="text-gold-400 italic">{t('real')}</span> {t('hospitality.')}
            </h1>
            <p className="mt-6 text-lg text-cream-200/85 max-w-xl">
              {t('From kakori kebabs to Lucknowi biryani — Muqim Caterers brings authentic Awadhi cooking, professional service and zero stress to your event.')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/book"
                className="rounded-full bg-gold-500 text-teal-950 font-semibold px-7 py-3.5 hover:bg-gold-400 transition-colors inline-flex items-center gap-2"
              >
                {t('Book your event')} <ArrowRight size={18} />
              </Link>
              <Link
                to="/packages"
                className="rounded-full border border-cream-50/30 px-7 py-3.5 font-semibold hover:bg-cream-50/10 transition-colors"
              >
                {t('Browse menus')}
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="hidden lg:block shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <img
              src="/logo.jpeg"
              alt="Muqim Caterer's — chef mascot"
              className="w-80 rounded-3xl bg-white/95 p-2 shadow-2xl rotate-2"
            />
          </motion.div>
        </div>
      </section>

      <section className="border-b border-cream-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ['1200+', t('events catered')],
            ['9 yrs', t('in the business')],
            ['4.9★', t('average rating')],
            ['30k+', t('guests served / year')],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-semibold text-teal-800">{v}</p>
              <p className="text-sm text-stone-500">{t(l)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-teal-900">{t('Popular packages')}</h2>
            <p className="text-stone-500 mt-2">{t('Curated menus for every occasion.')}</p>
          </div>
          <Link to="/packages" className="text-teal-700 font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
            {t('View all')} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
      </section>

      <section className="bg-teal-50 border-y border-cream-200">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-teal-900 text-center mb-12">
            {t('How it works')}
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-700 text-cream-50 grid place-items-center mb-4 relative">
                  <s.icon size={24} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-500 text-teal-950 text-xs font-bold grid place-items-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-teal-900">{t(s.title)}</h3>
                <p className="text-sm text-stone-500 mt-2 max-w-xs mx-auto">{t(s.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Quote className="text-gold-500 mb-4" size={32} />
            <p className="font-display text-2xl md:text-3xl font-medium text-teal-900 leading-snug">
              {t('"The biryani counter was the talk of our walima. Guests are still asking who catered it."')}
            </p>
            <p className="mt-4 text-sm text-stone-500 flex items-center gap-1">
              <Star size={14} className="text-gold-500 fill-gold-500" />
              {t('Rahman Family — 500-guest wedding, Aminabad')}
            </p>
          </div>
          <div className="bg-teal-950 rounded-3xl p-8 md:p-10 text-cream-50">
            <h3 className="font-display text-2xl font-semibold mb-3">{t('Planning an event?')}</h3>
            <p className="text-cream-300/85 text-sm mb-6">
              {t("Tell us the date and headcount — we'll send a quote within 24 hours.")}
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 text-teal-950 font-semibold px-6 py-3 hover:bg-gold-400 transition-colors"
            >
              {t('Get a quote')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
