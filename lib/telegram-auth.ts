import crypto from "node:crypto";
import { requireEnv } from "@/lib/env";
import type { SessionUser } from "@/lib/types";

interface TelegramUserPayload {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

function normalizeUsername(value: string | null | undefined, fallbackId: string): string {
  const cleaned = value?.trim().replace(/^@/, "").toLowerCase();

  if (cleaned) {
    return cleaned;
  }

  return `user${fallbackId}`;
}

export function verifyTelegramInitData(initDataRaw: string): SessionUser {
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get("hash");

  if (!hash) {
    throw new Error("Telegram init data is missing hash");
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) {
    throw new Error("Telegram init data is missing auth_date");
  }

  const ageInSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageInSeconds > 60 * 60 * 24) {
    throw new Error("Telegram init data has expired");
  }

  const checkString = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(requireEnv("TELEGRAM_BOT_TOKEN"))
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash))) {
    throw new Error("Telegram init data signature is invalid");
  }

  const rawUser = params.get("user");
  if (!rawUser) {
    throw new Error("Telegram init data is missing user");
  }

  const user = JSON.parse(rawUser) as TelegramUserPayload;
  const telegramUserId = String(user.id);

  return {
    telegramUserId,
    username: normalizeUsername(user.username ?? user.first_name, telegramUserId),
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
  };
}
