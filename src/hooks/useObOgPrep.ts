import { deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { seedObOgQuestions } from '../data/obogPrep'
import { db } from '../lib/firebase'
import type { ObOgQuestion } from '../types'
import { useAuth } from './useAuth'

// OB・OG訪問テンプレートはアカウントに 1 つだけなので、
// 面接対策テンプレートと同じく、ドキュメント ID = ユーザーの uid の 1 ドキュメントに持たせる
const COLLECTION = 'obogPreps'

/** テンプレートの中身（質問リスト + 汎用メモ） */
export interface ObOgPrepData {
  questions: ObOgQuestion[]
  memo: string
}

interface StoredObOgPrep {
  ownerId: string
  questions?: ObOgQuestion[]
  memo?: string
}

/** アカウント削除時のデータ掃除用。ドキュメントが未作成でもエラーにはならない */
export function deleteObOgPrep(userId: string): Promise<void> {
  return deleteDoc(doc(db, COLLECTION, userId))
}

export function useObOgPrep() {
  const { user } = useAuth()
  const [data, setData] = useState<ObOgPrepData>({ questions: [], memo: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // 再試行のたびに増やして useEffect を再実行し、購読を張り直す
  const [reloadKey, setReloadKey] = useState(0)
  // 「未作成 → 雛形を保存」を購読中に何度も繰り返さないためのフラグ
  const seededRef = useRef(false)

  useEffect(() => {
    if (!user) {
      setData({ questions: [], memo: '' })
      setLoading(false)
      setError(false)
      return
    }
    setLoading(true)
    setError(false)
    const ref = doc(db, COLLECTION, user.uid)
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          // 初回利用：聞くことリストの雛形を保存する。保存が反映された次のスナップショットで
          // loading が解除されるので、ここでは何も表示しない
          if (!seededRef.current) {
            seededRef.current = true
            setDoc(ref, { ownerId: user.uid, questions: seedObOgQuestions(), memo: '' }).catch(
              (err) => {
                console.error('OB・OG訪問テンプレートの初期化に失敗しました', err)
                setLoading(false)
              },
            )
          }
          return
        }
        const stored = snap.data() as StoredObOgPrep
        setData({ questions: stored.questions ?? [], memo: stored.memo ?? '' })
        setLoading(false)
        setError(false)
      },
      (err) => {
        // onSnapshot がエラーを返すと購読は停止するため、
        // 「テンプレートが空」と区別できるエラー状態にして再試行を促す
        console.error('OB・OG訪問テンプレートの取得に失敗しました', err)
        setLoading(false)
        setError(true)
      },
    )
    return unsubscribe
  }, [user, reloadKey])

  const retry = () => setReloadKey((k) => k + 1)

  // 楽観的更新：Firestore への書き込みが完了する前に画面上は即座に反映する
  const update = (updater: (d: ObOgPrepData) => ObOgPrepData) => {
    if (!user) return
    const current = data
    const next = updater(current)
    setData(next)
    updateDoc(doc(db, COLLECTION, user.uid), { questions: next.questions, memo: next.memo }).catch(
      (err) => {
        console.error('OB・OG訪問テンプレートの更新に失敗しました', err)
        // 「保存された」と誤解しないよう、画面表示を変更前の状態に戻す
        setData(current)
        alert('データの保存に失敗しました。変更前の状態に戻しました。通信環境をご確認の上、もう一度お試しください。')
      },
    )
  }

  return { data, loading, error, retry, update }
}
