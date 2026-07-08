import { Briefcase, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandMark from '../common/BrandMark'

/** 企業が1社も登録されていない、新規ユーザー向けの案内 */
export default function OnboardingEmptyState() {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <BrandMark />
      <h2 className="mt-4 text-lg font-extrabold text-ink">Career Compassへようこそ</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-sub">
        まだ企業が登録されていません。応募予定のインターンや本選考を登録して、選考状況をまとめて管理しましょう。
      </p>
      <Link to="/companies/new" className="btn-primary mt-6">
        <Plus size={16} strokeWidth={2.6} />
        最初の企業を登録する
      </Link>

      <div className="mt-8 grid w-full max-w-sm grid-cols-1 gap-2.5 border-t border-line pt-6 text-left sm:grid-cols-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Briefcase size={14} />
          </span>
          <p className="text-xs text-ink-sub">選考フローと予定を一元管理</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Briefcase size={14} />
          </span>
          <p className="text-xs text-ink-sub">ES・面接の振り返りを記録</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Briefcase size={14} />
          </span>
          <p className="text-xs text-ink-sub">インターン期間の重複も確認</p>
        </div>
      </div>
    </div>
  )
}