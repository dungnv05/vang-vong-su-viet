import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import {
  THEME_EVENT,
  resolveTheme,
  setTheme,
  type YunTheme,
  type YunThemeChangeDetail,
} from '../../theme/yunTheme'

export default function ThemeToggle() {
  const [theme, setCurrentTheme] = useState<YunTheme>(() => resolveTheme())

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<YunThemeChangeDetail>).detail
      if (detail?.theme === 'light' || detail?.theme === 'dark') {
        setCurrentTheme(detail.theme)
      } else {
        setCurrentTheme(resolveTheme())
      }
    }

    document.addEventListener(THEME_EVENT, onThemeChange)
    return () => {
      document.removeEventListener(THEME_EVENT, onThemeChange)
    }
  }, [])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="vv-theme-toggle"
      aria-label="Chuyển chế độ sáng/tối"
      title="Chuyển chế độ sáng/tối"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
    </button>
  )
}
