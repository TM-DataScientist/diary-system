# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

営業日報システム。営業担当者が日々の顧客訪問記録・課題（Problem）・翌日の計画（Plan）を記録し、上長がコメントできる社内Webアプリケーション。

現在は設計フェーズ。実装はまだ存在しない。

## 使用技術

- 言語: TypeScript
- フレームワーク: Next.js (App Router)
- UI コンポーネント: shadcn/ui + Tailwind CSS
- API スキーマ定義: OpenAPI (Zod による検証)
- DB スキーマ定義: Prisma.js
- テスト: Vitest
- デプロイ: Google Cloud Run

## 設計ドキュメント

| ファイル                   | 内容                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `doc/requirements.md`      | 機能要件・ERD（Mermaid）                                                            |
| `doc/screen-definition.md` | 画面一覧・画面遷移図・各画面の表示項目と操作定義                                    |
| `doc/api-spec.md`          | REST API仕様（エンドポイント・リクエスト/レスポンス例・バリデーション・エラー定義） |

## アーキテクチャの重要事項

### データモデル

5テーブル構成（詳細は `doc/requirements.md` のER図を参照）:

- `USERS` — 営業マスタ兼認証。`role` で `sales` / `manager` を区別
- `CUSTOMERS` — 顧客マスタ
- `DAILY_REPORTS` — 日報本体。`user_id + report_date` でユニーク。`status` は `draft` / `submitted`
- `VISIT_RECORDS` — 日報に紐づく訪問記録（複数行）。`visit_order` で表示順を保持
- `COMMENTS` — 上長コメント。`target_section` で `problem` / `plan` を区別

### 認証・権限

- JWT Bearer Token 認証
- ロールは2種類: `sales`（営業）/ `manager`（上長）
- 営業は自分の日報のみ参照・編集可能
- 上長は全員の日報を参照・コメント可能。マスタ管理も上長のみ

### APIの主要ルール

- ベースURL: `/v1`
- 日報は `draft` 状態のみ編集可能（`submitted` 後は変更不可）
- 同一ユーザーの同日日報は1件のみ（重複時は `409 Conflict`）
- 訪問記録・Problem・Plan は `submitted` 時のみ必須（`draft` 保存時は任意）
