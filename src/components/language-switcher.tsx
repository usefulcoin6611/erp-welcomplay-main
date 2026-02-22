'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { IconLanguage } from '@tabler/icons-react'
import { useLocale } from 'next-intl'

type Locale = 'id' | 'en'

export function LanguageSwitcher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const currentLocale = useLocale()

  const switchLocale = (locale: Locale) => {
    if (locale === currentLocale) return

    startTransition(() => {
      document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      router.refresh()
    })
  }

  const locales = [
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ]

  return (
    <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5">
      <IconLanguage className="mr-1 h-3.5 w-3.5 text-slate-500" />
      {locales.map((localeItem) => {
        const isActive = currentLocale === localeItem.code
        return (
          <button
            key={localeItem.code}
            type="button"
            disabled={isPending || isActive}
            onClick={() => switchLocale(localeItem.code as Locale)}
            className={[
              'px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer disabled:cursor-default',
              isActive
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:bg-blue-50 hover:text-blue-700',
            ].join(' ')}
          >
            {localeItem.flag}
          </button>
        )
      })}
    </div>
  )
}
