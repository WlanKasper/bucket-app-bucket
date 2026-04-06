import type { SessionUser } from "@/lib/types";

const DEFAULT_DEV_USER: SessionUser = {
  telegramUserId: "999000001",
  username: "bucket_local_dev",
  firstName: "Bucket",
  lastName: "Local",
  isDev: true,
};

function normalizeUsername(value: string | undefined): string {
  const normalized = value?.trim().replace(/^@/, "").toLowerCase();
  return normalized || DEFAULT_DEV_USER.username;
}

export function createLocalDevUser(overrides?: Partial<SessionUser>): SessionUser {
  return {
    telegramUserId:
      overrides?.telegramUserId?.trim() ||
      process.env.DEV_TELEGRAM_USER_ID?.trim() ||
      DEFAULT_DEV_USER.telegramUserId,
    username: normalizeUsername(overrides?.username || process.env.DEV_TELEGRAM_USERNAME),
    firstName:
      overrides?.firstName?.trim() ||
      process.env.DEV_TELEGRAM_FIRST_NAME?.trim() ||
      DEFAULT_DEV_USER.firstName,
    lastName:
      overrides?.lastName?.trim() ||
      process.env.DEV_TELEGRAM_LAST_NAME?.trim() ||
      DEFAULT_DEV_USER.lastName,
    isDev: true,
  };
}

export function isLocalDevRequest(request: Request): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const host = request.headers.get("host")?.toLowerCase() || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}
