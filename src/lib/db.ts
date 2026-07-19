import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { app } from './firebase'

// オフラインキャッシュ（IndexedDB）を有効化する。
// 2回目以降の表示はキャッシュから即座に返り、サーバーからは差分のみ読むため、
// 読み取り課金と初回表示時間の両方を削減できる。
// persistentMultipleTabManager: 複数タブで開いてもキャッシュを共有し、エラーにしない
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
