import { createContext, useContext, useEffect, useState } from 'react'
import { HI } from '@/lib/hi'

// Lightweight i18n — dictionary keyed on the English source string.
// t('Book Now') → Hindi when active, falls back to English when no entry exists,
// so untranslated copy never breaks.
const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (s) => s })

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('mq-lang') || 'en')

  const setLang = (l) => {
    setLangState(l)
    localStorage.setItem('mq-lang', l)
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  const t = (s) => (lang === 'hi' ? (HI[s] ?? s) : s)

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
export const useT = () => useContext(LangContext).t

// EN / हिं toggle chip.
export function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`inline-flex rounded-full border border-stone-300 overflow-hidden text-xs font-bold ${className}`}>
      {['en', 'hi'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 transition-colors ${
            lang === l ? 'bg-teal-700 text-cream-50' : 'bg-white text-stone-500 hover:text-teal-700'
          }`}
        >
          {l === 'en' ? 'EN' : 'हिं'}
        </button>
      ))}
    </div>
  )
}
