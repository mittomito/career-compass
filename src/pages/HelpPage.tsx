import { ChevronLeft, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FEEDBACK_FORM_URL } from '../data/constants'

/** アプリの使い方の説明ページ。トーンはプライバシーポリシー・利用規約と揃える */
export default function HelpPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-sub transition hover:text-brand"
      >
        <ChevronLeft size={16} />
        戻る
      </button>

      <div className="card p-6 sm:p-8">
        <h1 className="text-xl font-extrabold">ヘルプ・使い方</h1>
        <p className="mt-1 text-xs text-ink-faint">最終更新日：2026年7月19日</p>

        <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="mb-2 text-base font-bold">1. 企業の登録とホーム画面</h2>
            <p className="text-ink-sub">
              ヘッダーの「企業を登録」から、選考を受ける企業（インターン / 本選考）を登録できます。ホーム画面には登録した企業が一覧で表示され、企業名・メモでの検索、選考区分・ステータスでの絞り込み、「次回予定が近い順」「志望度が高い順」「企業名順」での並び替えができます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">2. 基本情報と志望度</h2>
            <p className="text-ink-sub">
              企業詳細の「基本情報」タブでは、業界・マイページURL・ログインID・メモに加えて、志望度（星1〜5）を設定できます。志望度は企業カードにも星で表示され、ホームの並び替えにも使えます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">3. 選考フローと予定の管理</h2>
            <p className="text-ink-sub">
              「選考」タブでは、ES → 面接 → 内定のような選考フロー（ステップ）を企業ごとに編集し、いま自分がどのステップにいるかを記録できます。予定（面接・Webテスト・説明会など）は種類・日時・場所・URL・メモ付きで登録でき、企業から複数の候補日を提示されている場合は候補日をまとめて登録できます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">4. カレンダー</h2>
            <p className="text-ink-sub">
              「カレンダー」ページでは、全企業の予定を月・週・日の3つの表示で確認できます。週表示・日表示では、時刻・場所・メモなど月表示より詳しい情報が見られます。「予定を追加」ボタンから、企業を選んでカレンダー上で直接予定を登録することもできます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">5. インターン期間カレンダー</h2>
            <p className="text-ink-sub">
              インターンの企業を登録すると、ヘッダーに「インターン期間」ページが表示されます。各企業の「選考」タブで参加期間を登録すると、複数社のインターン期間を1つのカレンダーで見比べられます。表示色は基本情報から企業ごとに変更できます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">6. ES（エントリーシート）管理</h2>
            <p className="text-ink-sub">
              「ES」タブでは、設問ごとに回答と文字数制限を登録できます。回答の文字数は自動でカウントされ、制限を超えると赤字で表示されます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">7. 面接対策</h2>
            <p className="text-ink-sub">
              ヘッダーの「面接対策」は、アカウント共通の想定質問テンプレートです。質問の下に「深掘り質問」をぶら下げて、面接官に突っ込まれる流れを事前に想定できます。企業ごとの対策は、各企業詳細の「面接対策」タブにテンプレートをコピーして、その企業向けに育てられます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">8. OB・OG訪問</h2>
            <p className="text-ink-sub">
              「OB・OG訪問テンプレート」ページには、どの企業の訪問でも使える「聞くことリスト」と汎用メモをまとめておけます。実際に訪問して聞いた話は、各企業詳細の「OB・OG訪問」タブに訪問日ごとに記録し、選考に活かせそうなポイントも残せます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">9. 振り返り</h2>
            <p className="text-ink-sub">
              「振り返り」タブでは、面接ごとに聞かれた質問・自分の回答・反省点を記録できます。ステータスを「不合格」「辞退」にすると、どのステップで選考が終わったか・敗因タグ・振り返りメモを残せます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">10. 企業研究</h2>
            <p className="text-ink-sub">
              「企業研究」タブでは、社長メッセージ・経営理念・事業内容などのカテゴリごとに、参照URL・要約・自分のメモを整理できます。カテゴリは自由に追加することもできます。入力内容は自動で保存されます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">11. 分析</h2>
            <p className="text-ink-sub">
              「分析」ページでは、選考ステップごとの通過率、敗因タグの集計、面接でよく聞かれた質問、業界別・月別の応募状況などを自動で集計します。振り返りの記録が増えるほど、分析の精度が上がります。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">12. データとアカウント</h2>
            <p className="text-ink-sub">
              入力したデータは自動でクラウドに保存され、ログインすれば別の端末からも同じデータを見られます。アカウントの削除（全データの完全削除）は「アカウント設定」から行えます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">13. 不具合・ご要望</h2>
            <p className="text-ink-sub">
              不具合の報告や機能のご要望は、以下のフォームからお寄せください。
            </p>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-3 inline-flex"
            >
              <ExternalLink size={14} />
              不具合・ご要望はこちら
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
