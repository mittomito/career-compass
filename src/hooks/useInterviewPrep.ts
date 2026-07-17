import { deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { seedPrepNodes } from '../data/interviewPrep'
import { db } from '../lib/firebase'
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
  // 「未作成 → 雛形を保存」を購読中に何度も繰り返さないためのフラグ
  const seededRef = useRef(false)

  useEffect(() => {
    if (!user) {
      setNodes([])
      setLoading(false)
      return
    }
    setLoading(true)
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
        setNodes((snap.data() as StoredPrep).nodes ?? [])
        setLoading(false)
      },
      (err) => {
        console.error('面接対策テンプレートの取得に失敗しました', err)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [user])

  // 楽観的更新：Firestore への書き込みが完了する前に画面上は即座に反映する
  const updateNodes = (updater: (nodes: PrepNode[]) => PrepNode[]) => {
    if (!user) return
    const next = updater(nodes)
    setNodes(next)
    updateDoc(doc(db, COLLECTION, user.uid), { nodes: next }).catch((err) => {
      console.error('面接対策テンプレートの更新に失敗しました', err)
      alert('データの保存に失敗しました。通信環境をご確認の上、もう一度お試しください。')
    })
  }

  return { nodes, loading, updateNodes }
}
