import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const VALID_ENV = {
  DATABASE_URL: "postgresql://postgres:password@localhost:5432/diary_system",
  DATABASE_URL_TEST:
    "postgresql://postgres:password@localhost:5432/diary_system_test",
  JWT_SECRET: "super-secret-jwt-key-for-testing",
  JWT_EXPIRES_IN: "7d",
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000",
};

describe("lib/env", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses valid environment variables", async () => {
    vi.stubEnv("DATABASE_URL", VALID_ENV.DATABASE_URL);
    vi.stubEnv("DATABASE_URL_TEST", VALID_ENV.DATABASE_URL_TEST);
    vi.stubEnv("JWT_SECRET", VALID_ENV.JWT_SECRET);
    vi.stubEnv("JWT_EXPIRES_IN", VALID_ENV.JWT_EXPIRES_IN);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", VALID_ENV.NEXT_PUBLIC_API_BASE_URL);

    const { env } = await import("@/lib/env");
    expect(env.DATABASE_URL).toBe(VALID_ENV.DATABASE_URL);
    expect(env.JWT_SECRET).toBe(VALID_ENV.JWT_SECRET);
    expect(env.JWT_EXPIRES_IN).toBe(VALID_ENV.JWT_EXPIRES_IN);
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe(VALID_ENV.NEXT_PUBLIC_API_BASE_URL);
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("JWT_SECRET", VALID_ENV.JWT_SECRET);
    vi.stubEnv("JWT_EXPIRES_IN", VALID_ENV.JWT_EXPIRES_IN);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", VALID_ENV.NEXT_PUBLIC_API_BASE_URL);

    await expect(import("@/lib/env")).rejects.toThrow("DATABASE_URL");
  });

  it("throws when JWT_SECRET is missing", async () => {
    vi.stubEnv("DATABASE_URL", VALID_ENV.DATABASE_URL);
    vi.stubEnv("JWT_SECRET", "");
    vi.stubEnv("JWT_EXPIRES_IN", VALID_ENV.JWT_EXPIRES_IN);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", VALID_ENV.NEXT_PUBLIC_API_BASE_URL);

    await expect(import("@/lib/env")).rejects.toThrow("JWT_SECRET");
  });

  it("throws when NEXT_PUBLIC_API_BASE_URL is not a valid URL", async () => {
    vi.stubEnv("DATABASE_URL", VALID_ENV.DATABASE_URL);
    vi.stubEnv("JWT_SECRET", VALID_ENV.JWT_SECRET);
    vi.stubEnv("JWT_EXPIRES_IN", VALID_ENV.JWT_EXPIRES_IN);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "not-a-url");

    await expect(import("@/lib/env")).rejects.toThrow("NEXT_PUBLIC_API_BASE_URL");
  });
});
