import type { ObOgQuestion } from '../types'
import { uid } from '../utils/id'

/**
 * OB・OG訪問テンプレートの初回利用時に用意する「聞くことリスト」の雛形。
 * 真っ白な画面から始めなくて済むようにするためのもので、自由に編集・削除できる。
 */
export function seedObOgQuestions(): ObOgQuestion[] {
  return [
    '現在の仕事内容と、1日の流れを教えてください。',
    '入社の決め手は何でしたか？',
    '入社前のイメージと入社後のギャップはありましたか？',
    '職場の雰囲気や、活躍している人の共通点を教えてください。',
    '就活のときにやっておいてよかったこと・後悔していることはありますか？',
  ].map((text) => ({ id: uid(), text }))
}
