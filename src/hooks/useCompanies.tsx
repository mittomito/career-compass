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
import { db } from '../lib/firebase'
import type { Company, NewCompanyInput } from '../types'
import { changedTopLevelFields } from '../utils/diff'
import { uid } from '../utils/id'

interface CompaniesStore {
  companies: Company[]
  loading: boolean
  getCompany: (id: string) => Company | undefined
  addCompany: (input: NewCompanyInput) => Promise<Company>
  updateCompany: (id: string, updater: (c: Company) => Company) => void
  removeCompany: (id: string) => void
  removeAllCompanies: () => Promise<void>
}

const CompaniesContext = createContext<CompaniesStore | null>(null)

const COLLECTION = 'companies'

/**
 * Firestore から取得したデータに既定値を補完して Company に整える。
 * 後からアプリに追加されたフィールド（internshipPeriods など）を持たない
 * 古いドキュメントを読んでもクラッシュしないようにするための防御層。
 */
function normalizeCompany(id: string, data: Partial<Omit<Company, 'id'>>): Company {
  return {
    id,
    name: data.name ?? '',
    industry: data.industry ?? '',
    type: data.type ?? '本選考',
    title: data.title ?? '',
    status: data.status ?? '応募予定',
    memo: data.memo ?? '',
    mypageUrl: data.mypageUrl ?? '',
    loginId: data.loginId ?? '',
    flow: data.flow ?? [],
    currentStepId: data.currentStepId ?? null,
    schedules: data.schedules ?? [],
    deadlines: data.deadlines ?? [],
    esEntries: data.esEntries ?? [],
    interviews: data.interviews ?? [],
    // research はフィールド自体の欠損に加え、カテゴリ追加時の「一部キーだけ無い」状態も補完する
    research: { ...emptyResearch(), ...data.research },
    internshipPeriods: data.internshipPeriods ?? [],
    ownerId: data.ownerId,
  }
}

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // ログイン中のユーザーの企業データだけを、リアルタイムで購読する
  useEffect(() => {
    if (!user) {
      setCompanies([])
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(collection(db, COLLECTION), where('ownerId', '==', user.uid))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) =>
          normalizeCompany(d.id, d.data() as Partial<Omit<Company, 'id'>>),
        )
        setCompanies(list)
        setLoading(false)
      },
      (err) => {
        console.error('企業データの取得に失敗しました', err)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user])

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
      deadlines: [],
      esEntries: [],
      interviews: [],
      research: emptyResearch(),
      internshipPeriods: [],
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
      alert('データの保存に失敗しました。通信環境をご確認の上、もう一度お試しください。')
    })
  }

  const removeCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    deleteDoc(doc(db, COLLECTION, id)).catch((err) => {
      console.error('企業データの削除に失敗しました', err)
    })
  }

  const removeAllCompanies = async () => {
    await Promise.all(companies.map((c) => deleteDoc(doc(db, COLLECTION, c.id))))
  }

  const value = useMemo(
    () => ({ companies, loading, getCompany, addCompany, updateCompany, removeCompany, removeAllCompanies }),
    // addCompany が user を参照するため、user も依存に含める（欠けると stale closure になる）
    [companies, loading, user],
  )

  return <CompaniesContext.Provider value={value}>{children}</CompaniesContext.Provider>
}

export function useCompanies(): CompaniesStore {
  const ctx = useContext(CompaniesContext)
  if (!ctx) throw new Error('useCompanies は CompaniesProvider の内側で使用してください')
  return ctx
}