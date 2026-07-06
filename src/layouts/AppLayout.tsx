import { Briefcase, CalendarDays, House, LogOut, Plus } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'

export default function AppLayout() {
  const { companies } = useCompanies()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const hasInternships = companies.some((c) => c.type === 'インターン')

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `btn-ghost ${isActive ? 'border-brand bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand' : ''}`

  const handleLogout = async () => {
    if (!window.confirm('ログアウトしますか？')) return
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link to="/home" className="flex items-center gap-2 text-[17px] font-extrabold tracking-wide">
            <BrandMark size="sm" />
            <span className="hidden sm:inline">Career Compass</span>
          </Link>
          <div className="flex-1" />
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <NavLink to="/home" className={navClass}>
              <House size={16} strokeWidth={2.2} />
              <span className="hidden sm:inline">ホーム</span>
            </NavLink>
            <NavLink to="/calendar" className={navClass}>
              <CalendarDays size={16} strokeWidth={2.2} />
              <span className="hidden sm:inline">カレンダー</span>
            </NavLink>
            {hasInternships && (
              <NavLink to="/internships" className={navClass}>
                <Briefcase size={16} strokeWidth={2.2} />
                <span className="hidden sm:inline">インターン期間</span>
              </NavLink>
            )}
            <Link to="/companies/new" className="btn-primary">
              <Plus size={16} strokeWidth={2.6} />
              <span className="hidden sm:inline">企業を登録</span>
            </Link>
            <button
              type="button"
              className="icon-btn"
              onClick={handleLogout}
              title="ログアウト"
              aria-label="ログアウト"
            >
              <LogOut size={16} strokeWidth={2.2} />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:px-6 sm:pt-7">
        <Outlet />
      </main>
    </div>
  )
}