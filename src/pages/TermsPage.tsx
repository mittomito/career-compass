import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-6 sm:px-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-sub transition hover:text-brand"
      >
        <ChevronLeft size={16} />
        戻る
      </Link>

      <div className="card p-6 sm:p-8">
        <h1 className="text-xl font-extrabold">利用規約</h1>
        <p className="mt-1 text-xs text-ink-faint">最終更新日：2026年7月18日</p>

        <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="mb-2 text-base font-bold">1. はじめに</h2>
            <p className="text-ink-sub">
              本規約は、Career Compass（以下「本サービス」）の利用条件を定めるものです。利用者は、本サービスに登録した時点で、本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">2. 本サービスの性質</h2>
            <p className="text-ink-sub">
              本サービスは、個人が開発・運営し、無償で提供している就職活動の管理アプリです。企業や団体によるサービスではないため、サポート体制や稼働保証には限りがあることをご理解ください。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">3. サービス内容の変更・提供の停止</h2>
            <p className="text-ink-sub">
              本サービスの機能・仕様は、予告なく変更されることがあります。また、運営上の都合により、本サービスの全部または一部の提供を、予告なく一時停止または終了する場合があります。提供の終了にあたっては、可能な範囲で事前にアプリ内でお知らせするよう努めます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">4. データの取り扱いについて</h2>
            <p className="text-ink-sub">
              登録されたデータの保全には最大限の注意を払っていますが、障害・不具合・その他の予期しない事情によるデータの消失が起こらないことを完全に保証することはできません。選考の合否に関わるような特に重要な情報（提出済みのESの内容、面接日時など）は、本サービス以外の場所にも控えを残しておくことをおすすめします。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">5. 禁止事項</h2>
            <p className="mb-2 text-ink-sub">利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc space-y-1.5 pl-5 text-ink-sub">
              <li>不正アクセス、または他の利用者のアカウント・データへアクセスを試みる行為</li>
              <li>本サービスのサーバーやネットワークに過度な負荷をかける行為、運営を妨害する行為</li>
              <li>他の利用者または第三者に迷惑・不利益・損害を与える行為</li>
              <li>法令または公序良俗に反する行為、およびそのおそれのある行為</li>
              <li>本サービスを、就職活動の管理という本来の目的から著しく逸脱した用途で利用する行為</li>
            </ul>
            <p className="mt-2 text-ink-sub">
              これらの行為が確認された場合、運営者は事前の通知なく、該当するアカウントの利用停止・削除などの措置を行うことがあります。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">6. 免責事項</h2>
            <p className="text-ink-sub">
              運営者は、本サービスの利用または利用不能により利用者に生じた損害（データの消失、就職活動における不利益、その他の損害を含みます）について、運営者に故意または重大な過失がある場合を除き、責任を負いません。本サービスは現状有姿で提供され、その正確性・完全性・特定目的への適合性を保証するものではありません。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">7. 個人情報の取り扱い</h2>
            <p className="text-ink-sub">
              個人情報の取り扱いについては、
              <Link to="/privacy" className="font-semibold text-brand hover:underline">
                プライバシーポリシー
              </Link>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">8. 本規約の変更</h2>
            <p className="text-ink-sub">
              本規約の内容は、必要に応じて予告なく変更される場合があります。重要な変更がある場合は、可能な範囲でアプリ内にてお知らせします。変更後も本サービスの利用を継続した場合、変更後の規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">9. お問い合わせ</h2>
            <p className="text-ink-sub">本規約に関するご質問は、運営者までお問い合わせください。</p>
          </section>
        </div>
      </div>
    </div>
  )
}
