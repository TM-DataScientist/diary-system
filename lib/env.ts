/**
 * 環境変数の型安全な読み込みユーティリティ
 *
 * Zod を用いて環境変数をバリデーションし、型安全なオブジェクトとしてエクスポートする。
 * 必須変数が未設定の場合はモジュールロード時に例外をスローしてアプリケーションの起動を阻止する。
 *
 * このモジュールはサーバーサイドでのみ使用すること。
 * `NEXT_PUBLIC_` プレフィックスを持たない変数はクライアントサイドでは参照できない。
 */

import { z } from "zod";

const envSchema = z.object({
  /** PostgreSQL 接続文字列 */
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  /** JWT 署名シークレット */
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  /** JWT トークン有効期限（例: 7d, 24h） */
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required"),

  /** フロントエンドから参照する API ベース URL */
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_API_BASE_URL is required")
    .url("NEXT_PUBLIC_API_BASE_URL must be a valid URL"),
});

/**
 * バリデーション済み環境変数の型
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数をパースしてバリデーションする。
 * 必須変数が未設定またはフォーマット不正の場合は起動時エラーをスローする。
 */
function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `[env] 環境変数の設定に誤りがあります。アプリケーションを起動できません:\n${formatted}`
    );
  }

  return result.data;
}

/**
 * バリデーション済みの環境変数オブジェクト
 *
 * @example
 * import { env } from "@/lib/env";
 * const dbUrl = env.DATABASE_URL;
 */
export const env = parseEnv();
