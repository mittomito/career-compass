import { deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { pruneLegacySeeds, seedPrepNodes } from '../data/interviewPrep'
import { db } from '../lib/db'
import type { PrepNode } from '../types'
import { useAuth } from './useAuth'

// 面接対策テンプレートはアカウントに 1 つだけなので、
// ドキュメント ID = ユーザーの uid とした 1 ドキュメントに全質問を持たせる
const COLLECTION = 'interviewPreps'

interface StoredPrep {
  ownerId: string
  nodes?: PrepNode[]
}

/** アカウント削除時のデータ掃除用。ドキュメントが未作成でもエラーにはならない */
export function deleteInterviewPrep(userId: string): Promise<void> {
  return deleteDoc(doc(db, COLLECTION, userId))
}

export function useInterviewPrep() {
  const { user } = useAuth()
  const [nodes, setNodes] = useState<PrepNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // 再試行のたびに増やして useEffect を再実行し、購読を張り直す
  const [reloadKey, setReloadKey] = useState(0)
  // 「未作成 → 雛形を保存」を購読中に何度も繰り返さないためのフラグ
  const seededRef = useRef(false)
  // 旧雛形の掃除の書き戻しを 1 回に留めるフラグ（失敗しても表示上は除去済みになる）
  const prunedRef = useRef(false)

  useEffect(() => {
    if (!user) {
      setNodes([])
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
          // 初回利用：定番質問の雛形を保存する。保存が反映された次のスナップショットで
          // loading が解除されるので、ここでは何も表示しない
          if (!seededRef.current) {
            seededRef.current = true
            setDoc(ref, { ownerId: user.uid, nodes: seedPrepNodes() }).catch((err) => {
              console.error('面接対策テンプレートの初期化に失敗しました', err)
              setLoading(false)
            })
          }
          return
        }
        const stored = (snap.data() as StoredPrep).nodes ?? []
        // 旧雛形（自己PRなど）が手つかずで残っていれば読み込み時に取り除き、
        // 取り除けた場合は Firestore にも書き戻して次回以降の掃除を不要にする
        const pruned = pruneLegacySeeds(stored)
        setNodes(pruned)
        setLoading(false)
        setError(false)
        if (pruned.length !== stored.length && !prunedRef.current) {
          prunedRef.current = true
          updateDoc(ref, { nodes: pruned }).catch((err) => {
            console.error('旧雛形の整理の保存に失敗しました', err)
          })
        }
      },
      (err) => {
        // onSnapshot がエラーを返すと購読は停止するため、
        // 「テンプレートが空」と区別できるエラー状態にして再試行を促す
        console.error('面接対策テンプレートの取得に失敗しました', err)
        setLoading(false)
        setError(true)
      },
    )
    return unsubscribe
  }, [user, reloadKey])

  const retry = () => setReloadKey((k) => k + 1)

  // 楽観的更新：Firestore への書き込みが完了する前に画面上は即座に反映する
  const updateNodes = (updater: (nodes: PrepNode[]) => PrepNode[]) => {
    if (!user) return
    const current = nodes
    const next = updater(current)
    setNodes(next)
    updateDoc(doc(db, COLLECTION, user.uid), { nodes: next }).catch((err) => {
      console.error('面接対策テンプレートの更新に失敗しました', err)
      // 「保存された」と誤解しないよう、画面表示を変更前の状態に戻す
      setNodes(current)
      alert('データの保存に失敗しました。変更前の状態に戻しました。通信環境をご確認の上、もう一度お試しください。')
    })
  }

  return { nodes, loading, error, retry, updateNodes }
}
