import type { Bucket, BucketItem, SessionUser } from "@/lib/types";

export function normalizeUsername(username: string): string {
  return username.trim().replace(/^@/, "").toLowerCase();
}

export function assertBucketItems(items: unknown): BucketItem[] {
  if (!Array.isArray(items)) {
    throw new Error("Bucket items must be an array");
  }

  return items.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Bucket item is invalid");
    }

    const record = item as Record<string, unknown>;
    const id = String(record.id ?? "");

    if (!id.trim()) {
      throw new Error("Bucket item id is required");
    }

    return {
      id,
      text: String(record.text ?? ""),
      checked: Boolean(record.checked),
    };
  });
}

export function ensureBucketAccess(bucket: Bucket, user: SessionUser) {
  if (
    bucket.ownerTelegramId !== user.telegramUserId &&
    !bucket.sharedWith.includes(normalizeUsername(user.username))
  ) {
    throw new Error("Forbidden");
  }
}

export function ensureBucketOwnership(bucket: Bucket, user: SessionUser) {
  if (bucket.ownerTelegramId !== user.telegramUserId) {
    throw new Error("Forbidden");
  }
}
