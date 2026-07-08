/**
 * after で変更されたトップレベルフィールドだけを返す。
 * 値の比較は JSON 表現による深い比較（before / after とも
 * JSON 化可能なプレーンなオブジェクトであることが前提）。
 *
 * Firestore の updateDoc へ「変更のあったフィールドだけ」を渡し、
 * ドキュメント全体の上書きで他端末の変更を巻き戻さないために使う。
 * キー順序の違いは「変更あり」と誤判定されることがあるが、
 * その場合も余分に1フィールド書き込むだけでデータは失われない。
 */
export function changedTopLevelFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, unknown> {
  const changed: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(after)) {
    if (JSON.stringify(value) !== JSON.stringify(before[key])) {
      changed[key] = value
    }
  }
  return changed
}
