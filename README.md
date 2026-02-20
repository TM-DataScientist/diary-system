# 営業日報システム

営業担当者が日々の顧客訪問記録・課題（Problem）・翌日の計画（Plan）を記録し、上長がコメントできる社内 Web アプリケーション。

## 技術スタック

| 種別 | 技術 |
|---|---|
| 言語 | TypeScript (strict モード) |
| フレームワーク | Next.js 14+ (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| API スキーマ | OpenAPI (Zod による検証) |
| DB スキーマ | Prisma.js |
| テスト | Vitest |
| デプロイ | Google Cloud Run |

## ディレクトリ構成

```
diary-system/
├── app/               # ルーティング・ページ (App Router)
│   ├── layout.tsx     # ルートレイアウト
│   ├── page.tsx       # トップページ
│   └── globals.css    # グローバルスタイル
├── components/        # 共通 UI コンポーネント
├── lib/               # ユーティリティ・API クライアント
├── types/             # 共通型定義
├── prisma/            # Prisma スキーマ・マイグレーション
├── tests/             # テストファイル
├── doc/               # 設計ドキュメント
├── next.config.ts     # Next.js 設定
├── tsconfig.json      # TypeScript 設定
└── postcss.config.mjs # PostCSS 設定
```

## セットアップ

### 前提条件

- Node.js 18.17.0 以上
- npm 9 以上

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと動作確認できます。

### ビルド

```bash
npm run build
```

### 本番起動

```bash
npm start
```

### Lint

```bash
npm run lint
```

### テスト

```bash
npm test
```

### CI（Lint + テスト）

```bash
npm run ci
```

## 設計ドキュメント

| ファイル | 内容 |
|---|---|
| `doc/requirements.md` | 機能要件・ERD |
| `doc/screen-definition.md` | 画面一覧・画面遷移図 |
| `doc/api-spec.md` | REST API 仕様 |
| `doc/test-spec.md` | テスト仕様 |

## デプロイ

Google Cloud Run へのデプロイは Makefile を使用します。

```bash
make deploy
```
