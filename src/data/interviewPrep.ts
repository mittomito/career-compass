import type { PrepNode } from '../types'
import { uid } from '../utils/id'

/**
 * 初回利用時に用意する定番質問。真っ白な画面から始めなくて済むようにするための
 * 雛形で、ユーザーは自由に編集・削除できる。ガクチカにだけ深掘りの例を付けて、
 * 「質問の下に深掘りをぶら下げる」という使い方が伝わるようにしている。
 */
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
    { id: uid(), parentId: null, question: '自己PRをお願いします。', answer: '' },
    { id: uid(), parentId: null, question: '当社を志望する理由を教えてください。', answer: '' },
    { id: uid(), parentId: null, question: 'あなたの強みと弱みを教えてください。', answer: '' },
  ]
}
