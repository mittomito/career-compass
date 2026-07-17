import type { PrepNode } from '../types'
import { uid } from '../utils/id'
import { childrenOf } from '../utils/prepTree'

/**
 * 初回利用時に用意する雛形。真っ白な画面から始めなくて済むように、
 * ガクチカ 1 件に深掘りの例を付けて「質問の下に深掘りをぶら下げる」という
 * 使い方が伝わるようにしている。ユーザーは自由に編集・削除できる。
 */
/** 旧バージョンの雛形で投入していた、ガクチカ以外の定番質問 */
const LEGACY_SEED_QUESTIONS = [
  '自己PRをお願いします。',
  '当社を志望する理由を教えてください。',
  'あなたの強みと弱みを教えてください。',
]

/**
 * 旧雛形で投入され、手つかずのまま残っている質問を取り除く。
 * 雛形をガクチカ 1 件に絞った変更を、作成済みのテンプレートにも波及させるための
 * 読み込み時移行。ユーザーが手を入れた形跡（回答の記入・深掘りの追加・ルート以外への
 * 移動はないので実質この2つ）があるものは、雛形と同文でも残す。
 */
export function pruneLegacySeeds(nodes: PrepNode[]): PrepNode[] {
  return nodes.filter(
    (n) =>
      !(
        n.parentId === null &&
        n.answer === '' &&
        LEGACY_SEED_QUESTIONS.includes(n.question) &&
        childrenOf(nodes, n.id).length === 0
      ),
  )
}

export function seedPrepNodes(): PrepNode[] {
  const gakuchika = uid()
  return [
    {
      id: gakuchika,
      parentId: null,
      question: '学生時代に最も力を入れたことを教えてください。',
      answer: '',
    },
    {
      id: uid(),
      parentId: gakuchika,
      question: 'なぜそれに取り組もうと思ったのですか？',
      answer: '',
    },
    {
      id: uid(),
      parentId: gakuchika,
      question: '一番苦労したことは何ですか？どう乗り越えましたか？',
      answer: '',
    },
  ]
}
