import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { INDUSTRIES, MAX_LEN } from '../data/constants'
import { useCompanies } from '../hooks/useCompanies'
import type { SelectionType } from '../types'

export default function RegisterPage() {
  const { addCompany } = useCompanies()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0])
  const [type, setType] = useState<SelectionType>('インターン')
  const [title, setTitle] = useState('')
  const [error, setError] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (submitting) return
    if (!name.trim()) {
      setError(true)
      return
    }
    setSubmitError('')
    setSubmitting(true)
    try {
      const company = await addCompany({
        name: name.trim(),
        industry,
        type,
        title: title.trim() || (type === 'インターン' ? 'インターンシップ' : '本選考'),
      })
      navigate(`/companies/${company.id}`)
    } catch {
      setSubmitError('登録に失敗しました。通信環境をご確認の上、もう一度お試しください。')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="card px-8 py-8">
        <h2 className="text-xl font-extrabold">企業を登録</h2>
        <p className="mb-6 mt-1 text-sm text-ink-sub">
          まずは4項目だけでOK。選考フロー・予定・ESなどは登録後の詳細ページから追加できます。
        </p>
        <div className="mb-4">
          <label htmlFor="name" className="field-label">
            企業名 <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            className={`input ${error ? 'border-danger' : ''}`}
            placeholder="例：株式会社〇〇"
            maxLength={MAX_LEN.short}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(false)
            }}
          />
          {error && <p className="mt-1 text-xs text-danger">企業名を入力してください。</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="industry" className="field-label">
            業界
          </label>
          <select id="industry" className="input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <span className="field-label">選考区分</span>
          <div className="flex gap-2">
            {(['インターン', '本選考'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${
                  type === t
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-line-strong bg-white text-ink-sub hover:border-line-strong'
                }`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-7">
          <label htmlFor="title" className="field-label">
            インターン名 / 本選考名
          </label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="例：夏季インターンシップ2026"
            maxLength={MAX_LEN.short}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {submitError && <p className="mb-3 text-xs font-semibold text-danger">{submitError}</p>}
        <div className="flex gap-2.5">
          <button
            type="button"
            className="btn-ghost flex-1"
            onClick={() => navigate('/home')}
            disabled={submitting}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn-primary flex-1 disabled:opacity-60"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? '登録中…' : '登録して詳細ページへ'}
          </button>
        </div>
      </div>
    </div>
  )
}
