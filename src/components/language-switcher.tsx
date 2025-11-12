'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconLanguage } from '@tabler/icons-react'
import { useLocale } from 'next-intl'

type Locale = 'id' | 'en'

export function LanguageSwitcher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const currentLocale = useLocale()

  const switchLocale = (locale: Locale) => {
    startTransition(() => {
      // Set cookie
      document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      
      // Refresh the page to apply new locale
      router.refresh()
    })
  }

  const locales = [
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const currentLocaleData = locales.find(l => l.code === currentLocale) || locales[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending} suppressHydrationWarning className="hover:cursor-pointer">
          <IconLanguage className="h-4 w-4 mr-2" />
          {currentLocaleData.flag} {currentLocaleData.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((localeItem) => (
          <DropdownMenuItem
            key={localeItem.code}
            onClick={() => switchLocale(localeItem.code as Locale)}
            className={currentLocale === localeItem.code ? 'bg-accent' : ''}
          >
            {localeItem.flag} {localeItem.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}