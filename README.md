# Career Compass

就職活動の選考状況を一元管理する個人向け Web アプリです。企業ごとの選考フロー・予定・ES・面接記録・企業研究・OB/OG 訪問をひとつにまとめ、振り返りデータから通過率や敗因傾向を自動で分析します。

## 開発の背景

（後日追記）

## 主な機能

- **企業管理** — 選考区分（インターン / 本選考）・ステータス・志望度（星 1〜5）付きで企業を登録。検索・絞り込み・並び替えに対応
- **選考フロー管理** — 企業ごとに ES → 面接 → 内定などのステップを自由に編集し、現在地を記録
- **予定管理とカレンダー** — 種類・日時・場所・URL・メモ付きの予定を登録（複数候補日にも対応）。月 / 週 / 日の 3 表示を切り替えられるカレンダーから直接追加も可能
- **インターン期間カレンダー** — 複数社のインターン参加期間を 1 つのタイムラインで俯瞰
- **ES 管理** — 設問ごとに回答と文字数制限を管理し、超過を自動検知
- **面接対策** — アカウント共通の想定質問テンプレートと企業別の対策を分離。質問に「深掘り質問」をぶら下げるツリー構造で、面接官の追撃を事前にシミュレート
- **OB・OG 訪問** — 共通の「聞くことリスト」テンプレートから質問を個別選択でコピーし、訪問日ごとに Q&A 形式で記録
- **振り返りと分析** — 面接ごとの反省・敗因タグを記録し、選考ステップ別通過率・頻出質問・月別応募数などを自動集計

## 技術スタック

| 領域 | 技術 |
|---|---|
| フロントエンド | React 18 / TypeScript / Vite |
| スタイリング | Tailwind CSS |
| ルーティング | React Router v6 |
| バックエンド | Firebase Authentication / Cloud Firestore |
| テスト | Vitest（ユーティリティ層の単体テスト） |
| CI | GitHub Actions（push / PR ごとに lint・テスト・型チェック + ビルドを Node 24 で実行） |
| ホスティング | Firebase Hosting |

### 設計上のポイント

- **リアルタイム同期と楽観的更新** — Firestore の `onSnapshot` で購読しつつ、書き込みは楽観的更新 + 失敗時ロールバックで体感速度と整合性を両立
- **部分更新** — ドキュメント全体の上書きではなく、変更されたトップレベルフィールドだけを diff して更新（他端末との同時編集で巻き戻さない）
- **スキーマの後方互換** — フィールド追加時は破壊的マイグレーションをせず、読み込み時の正規化層（`normalizeCompany`）で欠損値を補完
- **オフラインキャッシュ** — Firestore の永続キャッシュ（IndexedDB・マルチタブ共有）で再訪時の表示と読み取り課金を削減
- **セキュリティルール** — 全コレクションで所有者本人（`ownerId == request.auth.uid`）のみ読み書き可能

## ディレクトリ構成

```
├── src/
│   ├── pages/        ルーティング単位のページ（ホーム、企業詳細、カレンダー、分析など）
│   ├── components/   UI コンポーネント（common / home / detail / calendar / internship / prep）
│   ├── hooks/        Firestore 購読・認証などのカスタムフック（useCompanies, useAuth など）
│   ├── layouts/      認証後の共通レイアウト（ヘッダー・ナビゲーション）
│   ├── utils/        純粋関数ロジックとその単体テスト（正規化、イベント変換、分析集計など）
│   ├── data/         定数・プリセット・初期データ
│   └── lib/          Firebase の初期化
├── scripts/          Firestore バックアップスクリプト
├── firestore.rules   Firestore セキュリティルール
└── .github/          CI ワークフロー
```

## セットアップ

### 前提

- Node.js 24 以上（npm 11 系。`package-lock.json` が npm 11 で生成されているため、npm 10 以前では `npm ci` が失敗します）
- Firebase プロジェクト（Authentication のメール / パスワード認証と Cloud Firestore を有効化）

### 手順

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定（Firebase コンソールのウェブアプリ構成の値を記入）
cp .env.example .env

# 3. 開発サーバーの起動（http://localhost:5173）
npm run dev
```

`.env` に必要な変数は `.env.example` を参照してください（`VITE_FIREBASE_API_KEY` など 6 つ）。

### 検証コマンド

```bash
npm run lint     # ESLint
npm test         # Vitest（単体テスト）
npm run build    # tsc（型チェック）+ 本番ビルド
```

## デプロイ

Firebase Hosting と Firestore ルールをデプロイします。

```bash
# 本番ビルド → Hosting へ反映
npm run build
firebase deploy --only hosting

# セキュリティルールのみ反映
firebase deploy --only firestore:rules
```

Firestore のバックアップは `npm run backup` で取得できます（`serviceAccountKey.json` が必要。コミット対象外）。
