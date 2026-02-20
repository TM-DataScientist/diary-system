# 営業日報システム API仕様書

## 基本情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| ベースURL  | `https://api.example.com/v1` |
| データ形式 | JSON                         |
| 文字コード | UTF-8                        |
| 認証方式   | JWT Bearer Token             |

---

## 認証

全エンドポイント（`POST /auth/login` を除く）は以下のヘッダーが必要。

```
Authorization: Bearer {token}
```

---

## 共通レスポンス形式

### 成功時

```json
{
  "data": { ... }
}
```

### エラー時

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [{ "field": "email", "message": "メールアドレスの形式が正しくありません" }]
  }
}
```

### 共通エラーコード

| HTTPステータス | code                    | 説明                                     |
| -------------- | ----------------------- | ---------------------------------------- |
| 400            | `VALIDATION_ERROR`      | バリデーションエラー                     |
| 401            | `UNAUTHORIZED`          | 未認証・トークン期限切れ                 |
| 403            | `FORBIDDEN`             | 権限不足                                 |
| 404            | `NOT_FOUND`             | リソースが存在しない                     |
| 409            | `CONFLICT`              | 重複エラー（同日の日報が既に存在する等） |
| 500            | `INTERNAL_SERVER_ERROR` | サーバーエラー                           |

---

## エンドポイント一覧

| メソッド | パス                  | 概要             | 権限                     |
| -------- | --------------------- | ---------------- | ------------------------ |
| POST     | /auth/login           | ログイン         | 全員                     |
| POST     | /auth/logout          | ログアウト       | 全員                     |
| GET      | /reports              | 日報一覧取得     | 営業・上長               |
| POST     | /reports              | 日報作成         | 営業                     |
| GET      | /reports/:id          | 日報詳細取得     | 営業・上長               |
| PUT      | /reports/:id          | 日報更新         | 営業（本人・draft のみ） |
| POST     | /reports/:id/comments | コメント投稿     | 上長                     |
| GET      | /customers            | 顧客一覧取得     | 営業・上長               |
| POST     | /customers            | 顧客登録         | 上長                     |
| GET      | /customers/:id        | 顧客詳細取得     | 営業・上長               |
| PUT      | /customers/:id        | 顧客更新         | 上長                     |
| GET      | /users                | ユーザー一覧取得 | 上長                     |
| POST     | /users                | ユーザー登録     | 上長                     |
| GET      | /users/:id            | ユーザー詳細取得 | 上長                     |
| PUT      | /users/:id            | ユーザー更新     | 上長                     |

---

## 認証

### POST /auth/login

ログインしてJWTトークンを取得する。

**リクエスト**

```json
{
  "email": "yamada@example.com",
  "password": "password123"
}
```

**レスポンス** `200 OK`

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "name": "山田 太郎",
      "email": "yamada@example.com",
      "role": "sales",
      "department": "東京営業部"
    }
  }
}
```

**エラー**

| ステータス | code               | 条件                     |
| ---------- | ------------------ | ------------------------ |
| 400        | `VALIDATION_ERROR` | email・password が未入力 |
| 401        | `UNAUTHORIZED`     | 認証失敗                 |

---

### POST /auth/logout

トークンを無効化してログアウトする。

**レスポンス** `204 No Content`

---

## 日報

### GET /reports

日報一覧を取得する。営業は自分の日報のみ取得できる。上長は全員分取得できる。

**クエリパラメータ**

| パラメータ | 型                  | 必須 | 説明                             |
| ---------- | ------------------- | ---- | -------------------------------- |
| date_from  | string (YYYY-MM-DD) | 任意 | 開始日                           |
| date_to    | string (YYYY-MM-DD) | 任意 | 終了日                           |
| user_id    | integer             | 任意 | 作成者で絞り込み（上長のみ有効） |
| status     | string              | 任意 | `draft` または `submitted`       |
| page       | integer             | 任意 | ページ番号（デフォルト: 1）      |
| per_page   | integer             | 任意 | 1ページの件数（デフォルト: 20）  |

**レスポンス** `200 OK`

```json
{
  "data": {
    "reports": [
      {
        "report_id": 1,
        "report_date": "2026-02-19",
        "status": "submitted",
        "user": {
          "user_id": 1,
          "name": "山田 太郎"
        },
        "has_unread_comment": true,
        "created_at": "2026-02-19T18:00:00Z",
        "updated_at": "2026-02-19T18:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "per_page": 20,
      "total_pages": 3
    }
  }
}
```

---

### POST /reports

日報を新規作成する。同一ユーザーの同日日報が既に存在する場合は `409 Conflict`。

**リクエスト**

```json
{
  "report_date": "2026-02-19",
  "problem": "A社の予算が縮小傾向で、契約継続が懸念されます。",
  "plan": "明日はB社へのフォローアップ訪問を行う。",
  "status": "draft",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "新製品の提案を実施。担当者は前向きな反応。",
      "visit_order": 1
    },
    {
      "customer_id": 15,
      "visit_content": "契約更新の確認。次回までに見積もりを送付することを約束。",
      "visit_order": 2
    }
  ]
}
```

**バリデーション**

| フィールド                    | ルール                                |
| ----------------------------- | ------------------------------------- |
| report_date                   | 必須・YYYY-MM-DD 形式                 |
| status                        | 必須・`draft` または `submitted`      |
| problem                       | status=submitted の場合は必須         |
| plan                          | status=submitted の場合は必須         |
| visit_records                 | status=submitted の場合は1件以上必須  |
| visit_records[].customer_id   | 必須・存在する customer_id であること |
| visit_records[].visit_content | 必須                                  |
| visit_records[].visit_order   | 必須・1以上の整数                     |

**レスポンス** `201 Created`

```json
{
  "data": {
    "report_id": 1,
    "report_date": "2026-02-19",
    "status": "draft",
    "problem": "A社の予算が縮小傾向で、契約継続が懸念されます。",
    "plan": "明日はB社へのフォローアップ訪問を行う。",
    "user": {
      "user_id": 1,
      "name": "山田 太郎"
    },
    "visit_records": [
      {
        "visit_id": 1,
        "customer": {
          "customer_id": 10,
          "company_name": "株式会社A"
        },
        "visit_content": "新製品の提案を実施。担当者は前向きな反応。",
        "visit_order": 1
      }
    ],
    "comments": [],
    "created_at": "2026-02-19T18:00:00Z",
    "updated_at": "2026-02-19T18:00:00Z"
  }
}
```

**エラー**

| ステータス | code               | 条件                       |
| ---------- | ------------------ | -------------------------- |
| 400        | `VALIDATION_ERROR` | バリデーション違反         |
| 403        | `FORBIDDEN`        | 上長が作成しようとした場合 |
| 409        | `CONFLICT`         | 同日の日報が既に存在する   |

---

### GET /reports/:id

日報の詳細を取得する。営業は自分の日報のみ取得可能。

**レスポンス** `200 OK`

```json
{
  "data": {
    "report_id": 1,
    "report_date": "2026-02-19",
    "status": "submitted",
    "problem": "A社の予算が縮小傾向で、契約継続が懸念されます。",
    "plan": "明日はB社へのフォローアップ訪問を行う。",
    "user": {
      "user_id": 1,
      "name": "山田 太郎",
      "department": "東京営業部"
    },
    "visit_records": [
      {
        "visit_id": 1,
        "customer": {
          "customer_id": 10,
          "company_name": "株式会社A",
          "contact_name": "鈴木 一郎"
        },
        "visit_content": "新製品の提案を実施。担当者は前向きな反応。",
        "visit_order": 1
      }
    ],
    "comments": [
      {
        "comment_id": 1,
        "target_section": "problem",
        "comment_text": "先方との関係強化を優先しましょう。来週打ち合わせを設けます。",
        "commenter": {
          "user_id": 2,
          "name": "田中 部長"
        },
        "created_at": "2026-02-19T20:00:00Z"
      }
    ],
    "created_at": "2026-02-19T18:00:00Z",
    "updated_at": "2026-02-19T18:00:00Z"
  }
}
```

**エラー**

| ステータス | code        | 条件                                   |
| ---------- | ----------- | -------------------------------------- |
| 403        | `FORBIDDEN` | 他の営業担当者の日報にアクセスした場合 |
| 404        | `NOT_FOUND` | 日報が存在しない                       |

---

### PUT /reports/:id

日報を更新する。`draft` の場合のみ更新可能。作成者本人のみ操作可能。

**リクエスト**（POST /reports と同形式）

```json
{
  "problem": "A社の予算問題に加え、競合他社の提案も入っている模様。",
  "plan": "明日はB社訪問後、A社に電話フォローを実施する。",
  "status": "submitted",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "新製品の提案を実施。担当者は前向きな反応。",
      "visit_order": 1
    }
  ]
}
```

**レスポンス** `200 OK`（GET /reports/:id と同形式）

**エラー**

| ステータス | code               | 条件                                               |
| ---------- | ------------------ | -------------------------------------------------- |
| 400        | `VALIDATION_ERROR` | バリデーション違反                                 |
| 403        | `FORBIDDEN`        | 本人以外・上長が操作した場合                       |
| 404        | `NOT_FOUND`        | 日報が存在しない                                   |
| 409        | `CONFLICT`         | status が `submitted` の日報を更新しようとした場合 |

---

## コメント

### POST /reports/:id/comments

日報の Problem または Plan セクションにコメントを投稿する。上長のみ操作可能。

**リクエスト**

```json
{
  "target_section": "problem",
  "comment_text": "先方との関係強化を優先しましょう。来週打ち合わせを設けます。"
}
```

**バリデーション**

| フィールド     | ルール                        |
| -------------- | ----------------------------- |
| target_section | 必須・`problem` または `plan` |
| comment_text   | 必須                          |

**レスポンス** `201 Created`

```json
{
  "data": {
    "comment_id": 1,
    "report_id": 1,
    "target_section": "problem",
    "comment_text": "先方との関係強化を優先しましょう。来週打ち合わせを設けます。",
    "commenter": {
      "user_id": 2,
      "name": "田中 部長"
    },
    "created_at": "2026-02-19T20:00:00Z"
  }
}
```

**エラー**

| ステータス | code               | 条件                   |
| ---------- | ------------------ | ---------------------- |
| 400        | `VALIDATION_ERROR` | バリデーション違反     |
| 403        | `FORBIDDEN`        | 上長以外が操作した場合 |
| 404        | `NOT_FOUND`        | 日報が存在しない       |

---

## 顧客マスタ

### GET /customers

顧客一覧を取得する。

**クエリパラメータ**

| パラメータ | 型      | 必須 | 説明                            |
| ---------- | ------- | ---- | ------------------------------- |
| q          | string  | 任意 | 会社名・担当者名の部分一致検索  |
| page       | integer | 任意 | ページ番号（デフォルト: 1）     |
| per_page   | integer | 任意 | 1ページの件数（デフォルト: 50） |

**レスポンス** `200 OK`

```json
{
  "data": {
    "customers": [
      {
        "customer_id": 10,
        "company_name": "株式会社A",
        "contact_name": "鈴木 一郎",
        "phone": "03-1234-5678",
        "address": "東京都千代田区...",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "per_page": 50,
      "total_pages": 3
    }
  }
}
```

---

### POST /customers

顧客を新規登録する。上長のみ操作可能。

**リクエスト**

```json
{
  "company_name": "株式会社B",
  "contact_name": "佐藤 花子",
  "phone": "06-9876-5432",
  "address": "大阪府大阪市..."
}
```

**バリデーション**

| フィールド   | ルール |
| ------------ | ------ |
| company_name | 必須   |
| contact_name | 任意   |
| phone        | 任意   |
| address      | 任意   |

**レスポンス** `201 Created`

```json
{
  "data": {
    "customer_id": 11,
    "company_name": "株式会社B",
    "contact_name": "佐藤 花子",
    "phone": "06-9876-5432",
    "address": "大阪府大阪市...",
    "created_at": "2026-02-19T10:00:00Z",
    "updated_at": "2026-02-19T10:00:00Z"
  }
}
```

**エラー**

| ステータス | code               | 条件                     |
| ---------- | ------------------ | ------------------------ |
| 400        | `VALIDATION_ERROR` | company_name が未入力    |
| 403        | `FORBIDDEN`        | 営業担当者が操作した場合 |

---

### GET /customers/:id

顧客の詳細を取得する。

**レスポンス** `200 OK`（POST /customers レスポンスと同形式）

---

### PUT /customers/:id

顧客情報を更新する。上長のみ操作可能。

**リクエスト**（POST /customers と同形式）

**レスポンス** `200 OK`（POST /customers レスポンスと同形式）

---

## ユーザー管理

### GET /users

ユーザー一覧を取得する。上長のみ操作可能。

**クエリパラメータ**

| パラメータ | 型      | 必須 | 説明                            |
| ---------- | ------- | ---- | ------------------------------- |
| role       | string  | 任意 | `sales` または `manager`        |
| page       | integer | 任意 | ページ番号（デフォルト: 1）     |
| per_page   | integer | 任意 | 1ページの件数（デフォルト: 50） |

**レスポンス** `200 OK`

```json
{
  "data": {
    "users": [
      {
        "user_id": 1,
        "name": "山田 太郎",
        "email": "yamada@example.com",
        "role": "sales",
        "department": "東京営業部",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "per_page": 50,
      "total_pages": 1
    }
  }
}
```

---

### POST /users

ユーザーを新規登録する。上長のみ操作可能。

**リクエスト**

```json
{
  "name": "佐藤 次郎",
  "email": "sato@example.com",
  "password": "securepass123",
  "role": "sales",
  "department": "大阪営業部"
}
```

**バリデーション**

| フィールド | ルール                         |
| ---------- | ------------------------------ |
| name       | 必須                           |
| email      | 必須・メール形式・ユニーク     |
| password   | 必須・8文字以上                |
| role       | 必須・`sales` または `manager` |
| department | 任意                           |

**レスポンス** `201 Created`

```json
{
  "data": {
    "user_id": 3,
    "name": "佐藤 次郎",
    "email": "sato@example.com",
    "role": "sales",
    "department": "大阪営業部",
    "created_at": "2026-02-19T10:00:00Z",
    "updated_at": "2026-02-19T10:00:00Z"
  }
}
```

**エラー**

| ステータス | code               | 条件                       |
| ---------- | ------------------ | -------------------------- |
| 400        | `VALIDATION_ERROR` | バリデーション違反         |
| 403        | `FORBIDDEN`        | 営業担当者が操作した場合   |
| 409        | `CONFLICT`         | email が既に使用されている |

---

### GET /users/:id

ユーザーの詳細を取得する。上長のみ操作可能。

**レスポンス** `200 OK`（POST /users レスポンスと同形式）

---

### PUT /users/:id

ユーザー情報を更新する。上長のみ操作可能。

**リクエスト**

```json
{
  "name": "佐藤 次郎",
  "email": "sato-new@example.com",
  "password": "newpassword456",
  "role": "sales",
  "department": "名古屋営業部"
}
```

> `password` は変更しない場合は省略可能。

**レスポンス** `200 OK`（POST /users レスポンスと同形式）

---

## ロール定義

| ロール値  | 説明                                                 |
| --------- | ---------------------------------------------------- |
| `sales`   | 営業担当者。自分の日報の作成・編集のみ可能           |
| `manager` | 上長。全員の日報閲覧・コメント投稿・マスタ管理が可能 |
