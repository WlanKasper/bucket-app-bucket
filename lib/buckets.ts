import * as fileStore from "@/lib/file-store";
import {
  assertBucketItems,
  ensureBucketAccess,
  ensureBucketOwnership,
  normalizeUsername,
} from "@/lib/bucket-rules";
import { getStorageDriver } from "@/lib/storage-mode";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Bucket, BucketItem, SessionUser } from "@/lib/types";

interface BucketRow {
  id: string;
  name: string;
  description: string | null;
  items: BucketItem[] | null;
  owner_telegram_id: string;
  owner_username: string;
  shared_with: string[] | null;
  updated_at: string;
}

interface UserUpsertPayload {
  telegramUserId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

function toBucket(row: BucketRow): Bucket {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    items: row.items ?? [],
    ownerTelegramId: row.owner_telegram_id,
    ownerUsername: row.owner_username,
    sharedWith: row.shared_with ?? [],
    updatedAt: row.updated_at,
  };
}

function castBucketRow(value: unknown): BucketRow {
  return value as BucketRow;
}

export async function upsertUser(user: UserUpsertPayload) {
  if (getStorageDriver() === "file") {
    return await fileStore.upsertUser(user);
  }

  const admin = getSupabaseAdmin();

  const { error } = await admin.from("users").upsert(
    {
      telegram_user_id: user.telegramUserId,
      username: normalizeUsername(user.username),
      first_name: user.firstName,
      last_name: user.lastName,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "telegram_user_id",
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function listBucketsForUser(user: SessionUser): Promise<Bucket[]> {
  if (getStorageDriver() === "file") {
    return await fileStore.listBucketsForUser(user);
  }

  const admin = getSupabaseAdmin();
  const ownerUsername = normalizeUsername(user.username);

  const [ownedResult, sharedResult] = await Promise.all([
    admin
      .from("buckets")
      .select("*")
      .eq("owner_telegram_id", user.telegramUserId)
      .order("updated_at", { ascending: false }),
    admin
      .from("buckets")
      .select("*")
      .contains("shared_with", [ownerUsername])
      .order("updated_at", { ascending: false }),
  ]);

  if (ownedResult.error) {
    throw new Error(ownedResult.error.message);
  }

  if (sharedResult.error) {
    throw new Error(sharedResult.error.message);
  }

  const map = new Map<string, Bucket>();

  const ownedRows = ownedResult.data as unknown as BucketRow[];
  const sharedRows = sharedResult.data as unknown as BucketRow[];

  for (const row of [...ownedRows, ...sharedRows]) {
    map.set(row.id, toBucket(row));
  }

  return [...map.values()].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

export async function getBucketForUser(
  bucketId: string,
  user: SessionUser
): Promise<Bucket> {
  if (getStorageDriver() === "file") {
    return await fileStore.getBucketForUser(bucketId, user);
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("buckets")
    .select("*")
    .eq("id", bucketId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Bucket not found");
  }

  const bucket = toBucket(castBucketRow(data));
  ensureBucketAccess(bucket, user);
  return bucket;
}

export async function createBucketForUser(
  user: SessionUser,
  input: { name?: string; description?: string }
): Promise<Bucket> {
  if (getStorageDriver() === "file") {
    return await fileStore.createBucketForUser(user, input);
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("buckets")
    .insert({
      owner_telegram_id: user.telegramUserId,
      owner_username: normalizeUsername(user.username),
      name: input.name?.trim() || "Untitled bucket",
      description: input.description?.trim() || "",
      items: [],
      shared_with: [],
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toBucket(castBucketRow(data));
}

export async function updateBucketForUser(
  bucketId: string,
  user: SessionUser,
  input: { name?: unknown; description?: unknown; items?: unknown }
): Promise<Bucket> {
  if (getStorageDriver() === "file") {
    return await fileStore.updateBucketForUser(bucketId, user, input);
  }

  const existingBucket = await getBucketForUser(bucketId, user);
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from("buckets")
    .update({
      name:
        typeof input.name === "string" && input.name.trim()
          ? input.name.trim()
          : existingBucket.name,
      description:
        typeof input.description === "string"
          ? input.description.trim()
          : existingBucket.description,
      items:
        input.items === undefined ? existingBucket.items : assertBucketItems(input.items),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bucketId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toBucket(castBucketRow(data));
}

export async function deleteBucketForUser(bucketId: string, user: SessionUser) {
  if (getStorageDriver() === "file") {
    return await fileStore.deleteBucketForUser(bucketId, user);
  }

  const bucket = await getBucketForUser(bucketId, user);
  ensureBucketOwnership(bucket, user);

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("buckets").delete().eq("id", bucketId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function shareBucketWithUsername(
  bucketId: string,
  user: SessionUser,
  targetUsername: string
): Promise<Bucket> {
  if (getStorageDriver() === "file") {
    return await fileStore.shareBucketWithUsername(bucketId, user, targetUsername);
  }

  const bucket = await getBucketForUser(bucketId, user);
  ensureBucketOwnership(bucket, user);

  const normalized = normalizeUsername(targetUsername);
  if (!normalized) {
    throw new Error("Username is required");
  }

  if (normalized === normalizeUsername(user.username)) {
    throw new Error("You cannot share with yourself");
  }

  const sharedWith = Array.from(new Set([...bucket.sharedWith, normalized])).sort();
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from("buckets")
    .update({
      shared_with: sharedWith,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bucketId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toBucket(castBucketRow(data));
}

export async function unshareBucketWithUsername(
  bucketId: string,
  user: SessionUser,
  targetUsername: string
): Promise<Bucket> {
  if (getStorageDriver() === "file") {
    return await fileStore.unshareBucketWithUsername(bucketId, user, targetUsername);
  }

  const bucket = await getBucketForUser(bucketId, user);
  ensureBucketOwnership(bucket, user);

  const normalized = normalizeUsername(targetUsername);
  const sharedWith = bucket.sharedWith.filter((username) => username !== normalized);
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from("buckets")
    .update({
      shared_with: sharedWith,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bucketId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toBucket(castBucketRow(data));
}
