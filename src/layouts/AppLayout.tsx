import {
  Briefcase,
  CalendarDays,
  House,
  LogOut,
  Menu,
  MessagesSquare,
  Plus,
  Settings,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'

export default function AppLayout() {
  const { companies } = useCompanies()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const hasInternships = companies.some((c) => c.type === 'インターン')

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `btn-ghost ${isActive ? 'border-brand bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand' : ''}`

  // モバイルメニューの行。アクティブ表示はヘッダーの NavLink と同じ配色を踏襲する
  const menuItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
      isActive ? 'bg-brand-soft text-brand' : 'text-ink-sub hover:bg-brand-ghost hover:text-ink'
    }`

  // Esc キーでもメニューを閉じられるようにする
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const handleLogout = async () => {
    if (!window.confirm('ログアウトしますか？')) return
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
        <div className="relative mx-auto flex h-[60px] max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link to="/home" className="flex items-center gap-2 text-[17px] font-extrabold tracking-wide">
            <BrandMark size="sm" />
            <span className="hidden sm:inline">Career Compass</span>
          </Link>
          <div className="flex-1" />
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {/* デスクトップ（768px以上）：従来どおり全項目を横並びで表示 */}
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/home" className={navClass}>
                <House size={16} strokeWidth={2.2} />
                <span>ホーム</span>
              </NavLink>
              <NavLink to="/calendar" className={navClass}>
                <CalendarDays size={16} strokeWidth={2.2} />
                <span>カレンダー</span>
              </NavLink>
              {hasInternships && (
                <NavLink to="/internships" className={navClass}>
                  <Briefcase size={16} strokeWidth={2.2} />
                  <span>インターン期間</span>
                </NavLink>
              )}
              <NavLink to="/interview-prep" className={navClass}>
                <MessagesSquare size={16} strokeWidth={2.2} />
                <span>面接対策</span>
              </NavLink>
            </div>

            {/* 最も使用頻度が高い主要導線なので、モバイルでもヘッダーに単独で残す */}
            <Link to="/companies/new" className="btn-primary">
              <Plus size={16} strokeWidth={2.6} />
              企業を登録
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <Link to="/account" className="icon-btn" title="アカウント設定" aria-label="アカウント設定">
                <Settings size={16} strokeWidth={2.2} />
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
            </div>

            {/* モバイル（767px以下）：登録以外の項目はハンバーガーメニューへ */}
            <button
              type="button"
              className="icon-btn md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            >
              {menuOpen ? <X size={17} strokeWidth={2.2} /> : <Menu size={17} strokeWidth={2.2} />}
            </button>
          </nav>

          {menuOpen && (
            <>
              {/* メニュー外をタップしたら閉じるための透明な背景 */}
              <div
                className="fixed inset-0 z-40 md:hidden"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="card absolute right-4 top-[calc(100%+6px)] z-50 flex w-60 flex-col gap-0.5 p-2 md:hidden">
                <NavLink to="/home" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                  <House size={16} strokeWidth={2.2} />
                  ホーム
                </NavLink>
                <NavLink to="/calendar" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                  <CalendarDays size={16} strokeWidth={2.2} />
                  カレンダー
                </NavLink>
                {hasInternships && (
                  <NavLink to="/internships" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                    <Briefcase size={16} strokeWidth={2.2} />
                    インターン期間
                  </NavLink>
                )}
                <NavLink to="/interview-prep" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                  <MessagesSquare size={16} strokeWidth={2.2} />
                  面接対策
                </NavLink>
                <div className="my-1 border-t border-line" />
                <NavLink to="/account" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                  <Settings size={16} strokeWidth={2.2} />
                  アカウント設定
                </NavLink>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-ink-sub transition hover:bg-brand-ghost hover:text-ink"
                  onClick={() => {
                    setMenuOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut size={16} strokeWidth={2.2} />
                  ログアウト
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:px-6 sm:pt-7">
        <Outlet />
      </main>
    </div>
  )
}
