/**
 * Firestore の全データを JSON にエクスポートする手動バックアップスクリプト。
 *
 * 使い方:
 *   1. Firebase コンソール → プロジェクトの設定 → サービスアカウント → 「新しい秘密鍵の生成」
 *   2. ダウンロードした JSON をリポジトリ直下に serviceAccountKey.json として保存（git 管理外）
 *   3. npm run backup
 *
 * 出力: backups/firestore-backup-<日時>.json（backups/ も git 管理外）
 */
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const keyPath = process.argv[2] ?? 'serviceAccountKey.json'
if (!existsSync(keyPath)) {
  console.error(`サービスアカウントキーが見つかりません: ${keyPath}`)
  console.error(
    'Firebase コンソール → プロジェクトの設定 → サービスアカウント → 「新しい秘密鍵の生成」でダウンロードし、',
  )
  console.error('リポジトリ直下に serviceAccountKey.json として保存してから再実行してください。')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// アプリが使う全コレクション。コレクションを増やしたらここにも追加すること
const COLLECTIONS = ['companies', 'interviewPreps']

const backup = {
  exportedAt: new Date().toISOString(),
  projectId: serviceAccount.project_id,
  collections: {},
}

for (const name of COLLECTIONS) {
  const snap = await db.collection(name).get()
  backup.collections[name] = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]))
  console.log(`${name}: ${snap.size} 件`)
}

mkdirSync('backups', { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const outPath = path.join('backups', `firestore-backup-${stamp}.json`)
writeFileSync(outPath, JSON.stringify(backup, null, 2), 'utf8')
console.log(`保存しました: ${outPath}`)
process.exit(0)
