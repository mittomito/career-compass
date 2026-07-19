import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { emptyResearch } from '../data/research'
import { useAuth } from './useAuth'
import { db } from '../lib/db'
import type { Company, NewCompanyInput } from '../types'
import { changedTopLevelFields } from '../utils/diff'
import { normalizeCompany, type StoredCompany } from '../utils/normalize'
import { uid } from '../utils/id'

interface CompaniesStore {
  companies: Company[]
  loading: boolean
  /** 読み込み（購読）が失敗した状態。true の間はデータが空でも「0社」とは限らない */
  error: boolean
  /** 読み込み失敗後に購読をやり直す */
  retry: () => void
  getCompany: (id: string) => Company | undefined
  addCompany: (input: NewCompanyInput) => Promise<Company>
  updateCompany: (id: string, updater: (c: Company) => Company) => void
  removeCompany: (id: string) => void
  removeAllCompanies: () => Promise<void>
}

const CompaniesContext = createContext<CompaniesStore | null>(null)

const COLLECTION = 'companies'

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // 再試行のたびに増やして useEffect を再実行し、購読を張り直す
  const [reloadKey, setReloadKey] = useState(0)

  // ログイン中のユーザーの企業データだけを、リアルタイムで購読する
  useEffect(() => {
    if (!user) {
      setCompanies([])
      setLoading(false)
      setError(false)
      return
    }
    setLoading(true)
    setError(false)
    const q = query(collection(db, COLLECTION), where('ownerId', '==', user.uid))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => normalizeCompany(d.id, d.data() as StoredCompany))
        setCompanies(list)
        setLoading(false)
        setError(false)
      },
      (err) => {
        // onSnapshot がエラーを返すと購読は停止する（自動復帰しない）ため、
        // 「0社」と区別できるエラー状態にして、画面側で再試行を促す
        console.error('企業データの取得に失敗しました', err)
        setLoading(false)
        setError(true)
      },
    )
    return unsubscribe
  }, [user, reloadKey])

  const retry = () => setReloadKey((k) => k + 1)

  const getCompany = (id: string) => companies.find((c) => c.id === id)

  const addCompany = async (input: NewCompanyInput): Promise<Company> => {
    if (!user) throw new Error('ログインしていません')
    const flowLabels =
      input.type === 'インターン'
        ? ['応募', 'ES', '面接', '参加']
        : ['ES', 'Webテスト', '一次面接', '最終面接', '内定']
    const flow = flowLabels.map((label) => ({ id: uid(), label }))
    const base: Omit<Company, 'id'> = {
      name: input.name,
      industry: input.industry,
      type: input.type,
      title: input.title,
      status: '応募予定',
      memo: '',
      mypageUrl: '',
      loginId: '',
      flow,
      currentStepId: flow[0]?.id ?? null,
      schedules: [],
      esEntries: [],
      interviews: [],
      prepNodes: [],
      research: emptyResearch(),
      customResearch: [],
      internshipPeriods: [],
      rejectionMemo: '',
      rejectedStepId: null,
      rejectionTags: [],
      createdAt: new Date().toISOString(),
      color: '',
      aspiration: 0,
      obogVisits: [],
      // Firestore 側にのみ持たせる、データの持ち主を示すフィールド
      ownerId: user.uid,
    } as Omit<Company, 'id'> & { ownerId: string }
    const ref = await addDoc(collection(db, COLLECTION), base)
    return { id: ref.id, ...base }
  }

  // 楽観的更新：Firestore への書き込みが完了する前に画面上は即座に反映する
  const updateCompany = (id: string, updater: (c: Company) => Company) => {
    const current = companies.find((c) => c.id === id)
    if (!current) return
    const next = updater(current)
    setCompanies((prev) => prev.map((c) => (c.id === id ? next : c)))
    // 変更されたトップレベルフィールドだけを部分更新する。
    // ドキュメント全体を上書きすると、他端末が同時に編集した
    // 別フィールドの変更まで巻き戻してしまうため
    // （JSON 化は undefined の除去を兼ねる。Firestore は undefined を保存できない）
    const { id: _dropNext, ...nextRest } = next
    const { id: _dropCurrent, ...currentRest } = current
    const after = JSON.parse(JSON.stringify(nextRest)) as Record<string, unknown>
    const before = JSON.parse(JSON.stringify(currentRest)) as Record<string, unknown>
    const changed = changedTopLevelFields(before, after)
    if (Object.keys(changed).length === 0) return
    updateDoc(doc(db, COLLECTION, id), changed).catch((err) => {
      console.error('企業データの更新に失敗しました', err)
      // 「保存された」と誤解したまま離脱しないよう、画面表示を変更前の状態に戻す。
      // （この更新の後に同じ企業へ成功した更新があった場合はスナップショットが正す）
      setCompanies((prev) => prev.map((c) => (c.id === id ? current : c)))
      alert('データの保存に失敗しました。変更前の状態に戻しました。通信環境をご確認の上、もう一度お試しください。')
    })
  }

  const removeCompany = (id: string) => {
    const index = companies.findIndex((c) => c.id === id)
    const removed = companies[index]
    if (!removed) return
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    deleteDoc(doc(db, COLLECTION, id)).catch((err) => {
      // 黙って後で復活すると誤解を生むため、失敗した時点で一覧に戻して知らせる
      console.error('企業データの削除に失敗しました', err)
      setCompanies((prev) => {
        if (prev.some((c) => c.id === id)) return prev
        const next = [...prev]
        next.splice(Math.min(index, next.length), 0, removed)
        return next
      })
      alert('削除に失敗しました。通信環境をご確認の上、もう一度お試しください。')
    })
  }

  const removeAllCompanies = async () => {
    await Promise.all(companies.map((c) => deleteDoc(doc(db, COLLECTION, c.id))))
  }

  const value = useMemo(
    () => ({
      companies,
      loading,
      error,
      retry,
      getCompany,
      addCompany,
      updateCompany,
      removeCompany,
      removeAllCompanies,
    }),
    // addCompany が user を参照するため、user も依存に含める（欠けると stale closure になる）
    [companies, loading, error, user],
  )

  return <CompaniesContext.Provider value={value}>{children}</CompaniesContext.Provider>
}

export function useCompanies(): CompaniesStore {
  const ctx = useContext(CompaniesContext)
  if (!ctx) throw new Error('useCompanies は CompaniesProvider の内側で使用してください')
  return ctx
}