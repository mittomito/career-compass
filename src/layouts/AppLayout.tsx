import {
  BarChart3,
  Briefcase,
  CalendarDays,
  CircleHelp,
  CircleUserRound,
  ExternalLink,
  House,
  LogOut,
  Menu,
  MessagesSquare,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark'
import EmailVerificationBanner from '../components/common/EmailVerificationBanner'
import LoadErrorState from '../components/common/LoadErrorState'
import { FEEDBACK_FORM_URL } from '../data/constants'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'

export default function AppLayout() {
  const { companies, error: companiesError, retry } = useCompanies()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  // デスクトップで設定・ログアウトをまとめるアカウントメニュー
  const [accountOpen, setAccountOpen] = useState(false)
  const hasInternships = companies.some((c) => c.type === 'インターン')

  // px-3: 全項目を1行に収めるため、ヘッダー内では btn-ghost の左右パディングを詰める
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `btn-ghost px-3 ${isActive ? 'border-brand bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand' : ''}`

  // モバイルメニューの行。アクティブ表示はヘッダーの NavLink と同じ配色を踏襲する
  const menuItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
      isActive ? 'bg-brand-soft text-brand' : 'text-ink-sub hover:bg-brand-ghost hover:text-ink'
    }`

  // Esc キーでもメニューを閉じられるようにする
  useEffect(() => {
    if (!menuOpen && !accountOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setAccountOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, accountOpen])

  const handleLogout = async () => {
    if (!window.confirm('ログアウトしますか？')) return
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
        <div className="relative mx-auto flex h-[60px] max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link
            to="/home"
            className="flex shrink-0 items-center gap-2 text-[17px] font-extrabold tracking-wide"
          >
            <BrandMark size="sm" />
            {/* lg〜xl はナビ項目が増えて幅が足りないため、アプリ名はロゴだけにする */}
            <span className="hidden whitespace-nowrap sm:inline lg:hidden xl:inline">
              Career Compass
            </span>
          </Link>
          <div className="flex-1" />
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {/* デスクトップ（1024px以上）：主要ナビを横並びで表示 */}
            <div className="hidden items-center gap-2 lg:flex">
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
              <NavLink to="/ob-og-prep" className={navClass}>
                <Users size={16} strokeWidth={2.2} />
                <span>OB・OG訪問</span>
              </NavLink>
              <NavLink to="/analysis" className={navClass}>
                <BarChart3 size={16} strokeWidth={2.2} />
                <span>分析</span>
              </NavLink>
            </div>

            {/* 最も使用頻度が高い主要導線なので、モバイルでもヘッダーに単独で残す */}
            <Link to="/companies/new" className="btn-primary">
              <Plus size={16} strokeWidth={2.6} />
              企業を登録
            </Link>

            {/* デスクトップ：設定・ログアウトはアカウントメニューにまとめる */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                className="icon-btn"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-label={accountOpen ? 'アカウントメニューを閉じる' : 'アカウントメニューを開く'}
                title="アカウント"
              >
                <CircleUserRound size={17} strokeWidth={2.2} />
              </button>
              {accountOpen && (
                <>
                  {/* メニュー外をクリックしたら閉じるための透明な背景 */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="card absolute right-0 top-[calc(100%+10px)] z-50 flex w-56 flex-col gap-0.5 p-2">
                    <NavLink to="/help" className={menuItemClass} onClick={() => setAccountOpen(false)}>
                      <CircleHelp size={16} strokeWidth={2.2} />
                      ヘルプ・使い方
                    </NavLink>
                    <a
                      href={FEEDBACK_FORM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-sub transition hover:bg-brand-ghost hover:text-ink"
                      onClick={() => setAccountOpen(false)}
                    >
                      <ExternalLink size={16} strokeWidth={2.2} />
                      不具合・ご要望はこちら
                    </a>
                    <div className="my-1 border-t border-line" />
                    <NavLink to="/account" className={menuItemClass} onClick={() => setAccountOpen(false)}>
                      <Settings size={16} strokeWidth={2.2} />
                      アカウント設定
                    </NavLink>
                    <button
                      type="button"
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-ink-sub transition hover:bg-brand-ghost hover:text-ink"
                      onClick={() => {
                        setAccountOpen(false)
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

            {/* モバイル・中間幅（1023px以下）：登録以外の項目はハンバーガーメニューへ */}
            <button
              type="button"
              className="icon-btn lg:hidden"
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
                className="fixed inset-0 z-40 lg:hidden"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="card absolute right-4 top-[calc(100%+6px)] z-50 flex w-60 flex-col gap-0.5 p-2 lg:hidden">
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
                <NavLink to="/ob-og-prep" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                  <Users size={16} strokeWidth={2.2} />
                  OB・OG訪問
                </NavLink>
                <NavLink to="/analysis" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                  <BarChart3 size={16} strokeWidth={2.2} />
                  分析
                </NavLink>
                <div className="my-1 border-t border-line" />
                <NavLink to="/help" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                  <CircleHelp size={16} strokeWidth={2.2} />
                  ヘルプ・使い方
                </NavLink>
                <a
                  href={FEEDBACK_FORM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-sub transition hover:bg-brand-ghost hover:text-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink size={16} strokeWidth={2.2} />
                  不具合・ご要望はこちら
                </a>
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
      <EmailVerificationBanner />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:px-6 sm:pt-7">
        {/* 購読が失敗した状態で各ページを出すと「0社」の画面と区別がつかないため、
            ここで全ページ共通のエラー画面に差し替える */}
        {companiesError ? <LoadErrorState title="企業データの読み込みに失敗しました" onRetry={retry} /> : <Outlet />}
      </main>
    </div>
  )
}
