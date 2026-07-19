import { CalendarDays, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState'
import StatusBadge from '../components/common/StatusBadge'
import BasicInfoTab from '../components/detail/BasicInfoTab'
import EsTab from '../components/detail/EsTab'
import InterviewPrepTab from '../components/detail/InterviewPrepTab'
import InterviewTab from '../components/detail/InterviewTab'
import ObOgTab from '../components/detail/ObOgTab'
import ResearchTab from '../components/detail/ResearchTab'
import SelectionTab from '../components/detail/SelectionTab'
import { useCompanies } from '../hooks/useCompanies'
import { STATUS_LIST, type CompanyStatus } from '../types'
import LoadingState from '../components/common/LoadingState'

const TABS = [
  { key: 'basic', label: '基本情報' },
  { key: 'selection', label: '選考' },
  { key: 'es', label: 'ES' },
  { key: 'prep', label: '面接対策' },
  // 旧「面接」タブ。既存リンク（?tab=interview）を壊さないよう key は変えない
  { key: 'interview', label: '振り返り' },
  { key: 'research', label: '企業研究' },
  // 企業研究と同じ「情報収集系」なので隣に並べる（既存タブの並びは変えない）
  { key: 'obog', label: 'OB・OG訪問' },
] as const
type TabKey = (typeof TABS)[number]['key']

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCompany, updateCompany, removeCompany, loading } = useCompanies()
  const [params, setParams] = useSearchParams()

  // タブが画面幅に収まらないとき（主にモバイル）、右端にスクロール可能のヒントを出す
  const tabScrollRef = useRef<HTMLDivElement>(null)
  const [tabHintVisible, setTabHintVisible] = useState(false)
  const updateTabHint = () => {
    const el = tabScrollRef.current
    if (!el) return
    // 右端までスクロールし切ったらヒントを消す（8px は誤差の吸収）
    setTabHintVisible(el.scrollWidth - el.clientWidth - el.scrollLeft > 8)
  }
  useEffect(() => {
    updateTabHint()
    window.addEventListener('resize', updateTabHint)
    return () => window.removeEventListener('resize', updateTabHint)
  }, [loading])

  const company = id ? getCompany(id) : undefined

  if (loading) {
    return <LoadingState label="企業データを読み込み中…" />
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="企業が見つかりません"
          description="削除されたか、URL が正しくない可能性があります。"
        />
        <div className="mt-6 text-center">
          <Link to="/home" className="btn-primary inline-flex">
            ホームへ戻る
          </Link>
        </div>
      </div>
    )
  }

  const rawTab = params.get('tab')
  const tab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'basic'

  const changeTab = (next: TabKey) => {
    setParams(next === 'basic' ? {} : { tab: next }, { replace: true })
  }

  const changeStatus = (status: CompanyStatus) => {
    updateCompany(company.id, (c) => ({ ...c, status }))
  }

  const handleDelete = () => {
    if (window.confirm(`「${company.name}」を削除しますか？この操作は取り消せません。`)) {
      removeCompany(company.id)
      navigate('/home')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      <Link
        to="/home"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-sub transition hover:text-brand"
      >
        <ChevronLeft size={16} />
        ホームへ戻る
      </Link>

      <div className="card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{company.name}</h1>
              <StatusBadge status={company.status} />
            </div>
            <p className="mt-1.5 text-sm text-ink-sub">
              <span className="tag mr-2">{company.type}</span>
              {company.industry} ／ {company.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex flex-1 items-center gap-2 text-sm text-ink-sub sm:flex-none">
              <span className="hidden sm:inline">ステータス</span>
              <select
                value={company.status}
                onChange={(e) => changeStatus(e.target.value as CompanyStatus)}
                className="input h-9 w-full py-0 pr-8 text-sm sm:w-auto"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <Link to="/calendar" className="btn-ghost h-9 gap-1.5 text-sm">
              <CalendarDays size={15} />
              <span className="hidden sm:inline">カレンダー</span>
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="icon-btn text-ink-faint hover:border-danger hover:bg-danger-soft hover:text-danger"
              title="この企業を削除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-[60px] z-10 -mx-1 mt-6 bg-paper/95 py-2 backdrop-blur">
        <div className="relative">
          <div ref={tabScrollRef} onScroll={updateTabHint} className="overflow-x-auto px-1">
            <div className="flex w-max gap-1 rounded-xl border border-line bg-white p-1 shadow-card">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => changeTab(t.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    tab === t.key
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-ink-sub hover:bg-brand-ghost hover:text-brand'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* 右にまだタブがあることを示すフェード+矢印。スクロールし切ると消える */}
          {tabHintVisible && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-paper via-paper/70 to-transparent pl-10 pr-1"
              aria-hidden="true"
            >
              <ChevronRight size={15} className="text-ink-faint" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {tab === 'basic' && <BasicInfoTab company={company} />}
        {tab === 'selection' && <SelectionTab company={company} />}
        {tab === 'es' && <EsTab company={company} />}
        {tab === 'prep' && <InterviewPrepTab company={company} />}
        {tab === 'interview' && <InterviewTab company={company} />}
        {tab === 'research' && <ResearchTab company={company} />}
        {tab === 'obog' && <ObOgTab company={company} />}
      </div>
    </div>
  )
}