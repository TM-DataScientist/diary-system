# 営業日報システム テスト仕様書

## 1. 目的

本書は営業日報システムの受け入れ基準を明確化し、実装後のテスト実施時に判定可能な仕様を定義する。

## 2. テスト対象

- 対象ドキュメント
  - `requirements.md`
  - `screen-definition.md`
  - `api-spec.md`
- 対象機能
  - 認証（ログイン/ログアウト）
  - 日報作成・編集・閲覧
  - 上長コメント
  - 顧客マスタ管理
  - ユーザー管理
  - ロール別権限制御（`sales` / `manager`）

## 3. テスト方針

- 優先順位: 権限不備・データ不整合・状態遷移不備を最優先で検出する。
- テストレベル
  - API結合テスト: エンドポイント仕様、バリデーション、エラーコード検証
  - 画面結合テスト: 画面遷移、表示制御、入力制御検証
  - 回帰テスト: 主要業務フロー（ログイン→日報作成→提出→コメント）

## 4. 前提条件・テストデータ

- 事前登録ユーザー
  - `sales01@example.com`（role: `sales`）
  - `sales02@example.com`（role: `sales`）
  - `manager01@example.com`（role: `manager`）
- 顧客データ
  - `customer_id=10`（有効）
  - `customer_id=9999`（存在しないID）
- 日付
  - 当日: `2026-02-19`
  - 前日: `2026-02-18`

## 5. 合否判定基準

- Must（必須）テストケースの100%成功。
- Should（推奨）テストケースの95%以上成功。
- Critical障害（認証回避、他人データ更新、提出済み日報の改ざん）が0件。

## 6. テストケース

### 6.1 認証（API/画面）

| ID      | 優先   | 観点             | 事前条件      | 手順                                      | 期待結果                                      |
| ------- | ------ | ---------------- | ------------- | ----------------------------------------- | --------------------------------------------- |
| AUTH-01 | Must   | ログイン成功     | `sales01`存在 | 正しいemail/passwordで `POST /auth/login` | `200 OK`、`token` と `user.role=sales` を返す |
| AUTH-02 | Must   | ログイン失敗     | なし          | 誤ったpasswordでログイン                  | `401 UNAUTHORIZED`                            |
| AUTH-03 | Must   | 必須入力チェック | なし          | email未指定でログイン                     | `400 VALIDATION_ERROR`                        |
| AUTH-04 | Must   | 認証必須         | 未ログイン    | `GET /reports` を実行                     | `401 UNAUTHORIZED`                            |
| AUTH-05 | Should | ログアウト       | ログイン済み  | `POST /auth/logout`                       | `204 No Content`                              |
| AUTH-06 | Should | ログイン画面UI   | S01表示       | 必須未入力でログインボタン押下            | バリデーション表示、遷移しない                |

### 6.2 日報（作成・更新・参照）

| ID     | 優先   | 観点                   | 事前条件                     | 手順                                         | 期待結果                           |
| ------ | ------ | ---------------------- | ---------------------------- | -------------------------------------------- | ---------------------------------- |
| REP-01 | Must   | 下書き作成             | `sales01`ログイン            | 必須最小で `POST /reports`（`status=draft`） | `201 Created`、作成成功            |
| REP-02 | Must   | 提出時必須項目         | `sales01`ログイン            | `status=submitted` で `problem`欠落          | `400 VALIDATION_ERROR`             |
| REP-03 | Must   | 訪問記録必須           | `sales01`ログイン            | `status=submitted` で `visit_records=[]`     | `400 VALIDATION_ERROR`             |
| REP-04 | Must   | 同一日重複防止         | 当日日報作成済み             | 同日で再度 `POST /reports`                   | `409 CONFLICT`                     |
| REP-05 | Must   | 下書き更新             | `draft`日報あり              | `PUT /reports/:id` で内容更新                | `200 OK`、更新値が反映             |
| REP-06 | Must   | 提出済み更新禁止       | `submitted`日報あり          | `PUT /reports/:id`                           | `409 CONFLICT`                     |
| REP-07 | Must   | 本人以外更新禁止       | `sales02`で`sales01`日報更新 | `PUT /reports/:id`                           | `403 FORBIDDEN`                    |
| REP-08 | Must   | 一覧絞り込み           | 複数日報あり                 | `GET /reports?date_from=...&status=draft`    | 条件一致のみ返却                   |
| REP-09 | Should | 詳細取得               | 対象日報あり                 | `GET /reports/:id`                           | `200 OK`、訪問記録・コメントを含む |
| REP-10 | Should | 画面制御（編集ボタン） | S04表示                      | `submitted`日報を表示                        | 編集ボタン非表示                   |

### 6.3 コメント（上長）

| ID     | 優先   | 観点                 | 事前条件                          | 手順                                                    | 期待結果                       |
| ------ | ------ | -------------------- | --------------------------------- | ------------------------------------------------------- | ------------------------------ |
| CMT-01 | Must   | コメント投稿成功     | `manager01`ログイン、対象日報あり | `POST /reports/:id/comments` (`target_section=problem`) | `201 Created`                  |
| CMT-02 | Must   | 権限制御             | `sales01`ログイン                 | コメント投稿API実行                                     | `403 FORBIDDEN`                |
| CMT-03 | Must   | target_section妥当性 | `manager01`ログイン               | `target_section=other`                                  | `400 VALIDATION_ERROR`         |
| CMT-04 | Should | コメント表示         | コメント登録済み                  | S04を表示                                               | 投稿者・日時・本文が表示される |

### 6.4 顧客マスタ

| ID     | 優先   | 観点         | 事前条件            | 手順                            | 期待結果               |
| ------ | ------ | ------------ | ------------------- | ------------------------------- | ---------------------- |
| CUS-01 | Must   | 一覧取得     | `sales01`ログイン   | `GET /customers`                | `200 OK`               |
| CUS-02 | Must   | 上長登録権限 | `manager01`ログイン | `POST /customers`（会社名あり） | `201 Created`          |
| CUS-03 | Must   | 営業登録禁止 | `sales01`ログイン   | `POST /customers`               | `403 FORBIDDEN`        |
| CUS-04 | Must   | 必須入力     | `manager01`ログイン | 会社名なしで登録                | `400 VALIDATION_ERROR` |
| CUS-05 | Should | 検索機能     | 顧客複数あり        | `GET /customers?q=株式会社`     | 部分一致で返却         |

### 6.5 ユーザー管理

| ID     | 優先   | 観点                 | 事前条件            | 手順                            | 期待結果               |
| ------ | ------ | -------------------- | ------------------- | ------------------------------- | ---------------------- |
| USR-01 | Must   | 一覧取得権限         | `manager01`ログイン | `GET /users`                    | `200 OK`               |
| USR-02 | Must   | 営業アクセス禁止     | `sales01`ログイン   | `GET /users`                    | `403 FORBIDDEN`        |
| USR-03 | Must   | ユーザー作成成功     | `manager01`ログイン | 必須項目で `POST /users`        | `201 Created`          |
| USR-04 | Must   | email重複チェック    | 同一email既存       | `POST /users`                   | `409 CONFLICT`         |
| USR-05 | Must   | パスワード桁数       | `manager01`ログイン | 8文字未満で登録                 | `400 VALIDATION_ERROR` |
| USR-06 | Should | 更新時パスワード任意 | 既存ユーザーあり    | passwordなしで `PUT /users/:id` | `200 OK`               |

### 6.6 権限・状態遷移（横断）

| ID     | 優先 | 観点                     | 事前条件                    | 手順                     | 期待結果                  |
| ------ | ---- | ------------------------ | --------------------------- | ------------------------ | ------------------------- |
| ACL-01 | Must | 営業は自分の日報のみ参照 | `sales01`,`sales02`日報あり | `sales01`で一覧/詳細取得 | `sales01`分のみ閲覧可     |
| ACL-02 | Must | 上長は全日報参照可       | 日報複数あり                | `manager01`で一覧取得    | 全営業分取得可            |
| ACL-03 | Must | draft→submitted遷移      | `draft`日報あり             | 提出更新を実施           | `status=submitted` へ遷移 |
| ACL-04 | Must | submitted再編集不可      | `submitted`日報あり         | 再更新を実施             | 更新拒否（`409`）         |

## 7. 実施・報告ルール

- 実施記録は「実施日」「実施者」「結果（Pass/Fail）」「証跡URLまたはログ」を必須記録する。
- Fail時は再現手順、実際結果、期待結果、影響範囲をチケット化する。
- APIテスト結果はリクエスト/レスポンス本文を保存する（個人情報はマスク）。

## 8. 変更管理

- 要件変更時は、本書の該当テストIDを更新し、PRに差分理由を記載する。
- `api-spec.md` のエンドポイント追加/変更時は、同一PRでテストケースを追加する。
