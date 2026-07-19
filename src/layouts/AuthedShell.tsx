import { CompaniesProvider } from '../hooks/useCompanies'
import AppLayout from './AppLayout'

/**
 * ログイン後の画面全体の入口。CompaniesProvider（Firestore 購読）をここに置くことで、
 * Firestore 関連のコードがこのチャンクにまとまり、ログイン画面の初回表示では
 * 読み込まれないようにしている（App.tsx から React.lazy で読み込む）。
 * useCompanies を使うコンポーネントはすべてこの配下にある。
 */
export default function AuthedShell() {
  return (
    <CompaniesProvider>
      <AppLayout />
    </CompaniesProvider>
  )
}
