import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { auth } from '../lib/firebase'

interface AuthStore {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  /** 確認メールを（再）送信する。未ログインなら何もしない */
  resendVerification: () => Promise<void>
  reauthenticate: (password: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthStore | null>(null)

/** Firebase Authentication のログイン状態をアプリ全体に共有する */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    // メールアドレスの typo に気づけるよう確認メールを送る。
    // 送信失敗で登録自体を失敗にはしない（アプリ内バナーから再送できる）
    try {
      await sendEmailVerification(cred.user)
    } catch (err) {
      console.error('確認メールの送信に失敗しました', err)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const resendVerification = async () => {
    if (!auth.currentUser) return
    await sendEmailVerification(auth.currentUser)
  }

  /** アカウント削除などの機微な操作の前に、パスワードで本人確認を行う */
  const reauthenticate = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error('ログインしていません')
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
    await reauthenticateWithCredential(auth.currentUser, credential)
  }

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error('ログインしていません')
    await deleteUser(auth.currentUser)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      resetPassword,
      resendVerification,
      reauthenticate,
      deleteAccount,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth は AuthProvider の内側で使用してください')
  return ctx
}