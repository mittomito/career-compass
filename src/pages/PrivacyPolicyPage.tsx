import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
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
        <h1 className="text-xl font-extrabold">プライバシーポリシー</h1>
        <p className="mt-1 text-xs text-ink-faint">最終更新日：2026年7月7日</p>

        <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="mb-2 text-base font-bold">1. はじめに</h2>
            <p className="whitespace-pre-wrap break-words text-ink-sub">
              Career Compass（以下「本サービス」）は、就職活動における選考状況の管理を目的とした個人開発のアプリです。本サービスは、利用者から預かる情報を誠実に取り扱うため、本ポリシーで収集する情報・利用目的・管理方法を説明します。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">2. 収集する情報</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-ink-sub">
              <li>アカウント情報：メールアドレス（パスワードは Firebase Authentication により暗号化され、運営者を含め誰も平文では閲覧できません）</li>
              <li>選考管理データ：登録した企業名、選考状況、エントリーシートの内容、面接記録、企業研究メモ、予定・締切など、利用者が入力した内容</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">3. 利用目的</h2>
            <p className="text-ink-sub">
              収集した情報は、本サービスが提供する就職活動の選考管理機能（企業ごとの状況表示、カレンダー表示、ES・面接記録の保存など）を利用者に提供する目的にのみ使用します。広告配信や、本サービスの提供に関係のない目的での利用は行いません。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">4. データの保存場所</h2>
            <p className="text-ink-sub">
              入力されたデータは、Google社が提供するクラウド基盤（Firebase / Google Cloud、東京リージョン）に保存されます。通信は全て暗号化（HTTPS）されており、データベースへのアクセスは、ログインしている本人のアカウントに紐づく情報のみに制限されています（他の利用者のデータを閲覧することはできません）。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">5. 運営者によるデータへのアクセスについて</h2>
            <p className="text-ink-sub">
              本サービスの運営者は、データベースの管理者権限を保持しているため、技術的には登録されたデータにアクセスできる立場にあります。運営者は、不具合対応など本サービスの維持管理に真に必要な場合を除き、利用者のデータの内容を閲覧することはありません。第三者へのデータの提供・販売は一切行いません。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">6. データの削除について</h2>
            <p className="text-ink-sub">
              利用者はいつでも、アプリ内の「アカウント設定」画面からアカウントを削除できます。削除操作を行うと、登録した企業データ・ES・面接記録などは全てデータベースから完全に削除され、復元することはできません。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">7. Cookie等の利用</h2>
            <p className="text-ink-sub">
              本サービスは、ログイン状態を維持するために、ブラウザの認証情報保存機能（Firebase Authentication の仕組み）を利用します。広告目的でのトラッキングは行っていません。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">8. 本ポリシーの変更</h2>
            <p className="text-ink-sub">
              本ポリシーの内容は、本サービスの機能追加・変更に伴い、予告なく更新される場合があります。重要な変更がある場合は、可能な範囲でアプリ内にてお知らせします。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold">9. お問い合わせ</h2>
            <p className="text-ink-sub">
              本サービスの取り扱いに関するご質問は、運営者までお問い合わせください。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}