import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  assertBucketItems,
  ensureBucketAccess,
  ensureBucketOwnership,
  normalizeUsername,
} from "@/lib/bucket-rules";
import type { Bucket, SessionUser } from "@/lib/types";

interface UserRecord {
  telegramUserId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  updatedAt: string;
}

interface FileDatabase {
  users: UserRecord[];
  buckets: Bucket[];
}

interface UserUpsertPayload {
  telegramUserId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

const DATABASE_PATH = path.join(process.cwd(), ".data", "bucket-dev-db.json");

async function readDatabase(): Promise<FileDatabase> {
  try {
    const file = await readFile(DATABASE_PATH, "utf8");
    const parsed = JSON.parse(file) as Partial<FileDatabase>;

    return {
      users: parsed.users ?? [],
      buckets: parsed.buckets ?? [],
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      return {
        users: [],
        buckets: [],
      };
    }

    throw error;
  }
}

async function writeDatabase(database: FileDatabase) {
  await mkdir(path.dirname(DATABASE_PATH), { recursive: true });
  await writeFile(DATABASE_PATH, JSON.stringify(database, null, 2));
}

function sortBucketsByUpdateDate(buckets: Bucket[]) {
  return [...buckets].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function upsertUser(user: UserUpsertPayload) {
  const database = await readDatabase();
  const username = normalizeUsername(user.username);
  const updatedUser: UserRecord = {
    telegramUserId: user.telegramUserId,
    username,
    firstName: user.firstName,
    lastName: user.lastName,
    updatedAt: new Date().toISOString(),
  };

  database.users = database.users.filter(
    (entry) =>
      entry.telegramUserId !== updatedUser.telegramUserId &&
      entry.username !== updatedUser.username
  );
  database.users.push(updatedUser);

  database.buckets = database.buckets.map((bucket) =>
    bucket.ownerTelegramId === updatedUser.telegramUserId
      ? { ...bucket, ownerUsername: updatedUser.username }
      : bucket
  );

  await writeDatabase(database);
}

export async function listBucketsForUser(user: SessionUser): Promise<Bucket[]> {
  const database = await readDatabase();
  const username = normalizeUsername(user.username);

  return sortBucketsByUpdateDate(
    database.buckets.filter(
      (bucket) =>
        bucket.ownerTelegramId === user.telegramUserId ||
        bucket.sharedWith.includes(username)
    )
  );
}

export async function getBucketForUser(
  bucketId: string,
  user: SessionUser
): Promise<Bucket> {
  const database = await readDatabase();
  const bucket = database.buckets.find((entry) => entry.id === bucketId);

  if (!bucket) {
    throw new Error("Bucket not found");
  }

  ensureBucketAccess(bucket, user);
  return bucket;
}

export async function createBucketForUser(
  user: SessionUser,
  input: { name?: string; description?: string }
): Promise<Bucket> {
  const database = await readDatabase();

  const bucket: Bucket = {
    id: crypto.randomUUID(),
    name: input.name?.trim() || "Untitled bucket",
    description: input.description?.trim() || "",
    items: [],
    ownerTelegramId: user.telegramUserId,
    ownerUsername: normalizeUsername(user.username),
    sharedWith: [],
    updatedAt: new Date().toISOString(),
  };

  database.buckets.push(bucket);
  await writeDatabase(database);

  return bucket;
}

export async function updateBucketForUser(
  bucketId: string,
  user: SessionUser,
  input: { name?: unknown; description?: unknown; items?: unknown }
): Promise<Bucket> {
  const database = await readDatabase();
  const bucketIndex = database.buckets.findIndex((entry) => entry.id === bucketId);

  if (bucketIndex === -1) {
    throw new Error("Bucket not found");
  }

  const existingBucket = database.buckets[bucketIndex];
  ensureBucketAccess(existingBucket, user);

  const updatedBucket: Bucket = {
    ...existingBucket,
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
    updatedAt: new Date().toISOString(),
  };

  database.buckets[bucketIndex] = updatedBucket;
  await writeDatabase(database);

  return updatedBucket;
}

export async function deleteBucketForUser(bucketId: string, user: SessionUser) {
  const database = await readDatabase();
  const bucket = database.buckets.find((entry) => entry.id === bucketId);

  if (!bucket) {
    throw new Error("Bucket not found");
  }

  ensureBucketOwnership(bucket, user);
  database.buckets = database.buckets.filter((entry) => entry.id !== bucketId);
  await writeDatabase(database);
}

export async function shareBucketWithUsername(
  bucketId: string,
  user: SessionUser,
  targetUsername: string
): Promise<Bucket> {
  const database = await readDatabase();
  const bucketIndex = database.buckets.findIndex((entry) => entry.id === bucketId);

  if (bucketIndex === -1) {
    throw new Error("Bucket not found");
  }

  const existingBucket = database.buckets[bucketIndex];
  ensureBucketOwnership(existingBucket, user);

  const normalizedTargetUsername = normalizeUsername(targetUsername);

  if (!normalizedTargetUsername) {
    throw new Error("Username is required");
  }

  if (normalizedTargetUsername === normalizeUsername(user.username)) {
    throw new Error("You cannot share with yourself");
  }

  const updatedBucket: Bucket = {
    ...existingBucket,
    sharedWith: Array.from(
      new Set([...existingBucket.sharedWith, normalizedTargetUsername])
    ).sort(),
    updatedAt: new Date().toISOString(),
  };

  database.buckets[bucketIndex] = updatedBucket;
  await writeDatabase(database);

  return updatedBucket;
}

export async function unshareBucketWithUsername(
  bucketId: string,
  user: SessionUser,
  targetUsername: string
): Promise<Bucket> {
  const database = await readDatabase();
  const bucketIndex = database.buckets.findIndex((entry) => entry.id === bucketId);

  if (bucketIndex === -1) {
    throw new Error("Bucket not found");
  }

  const existingBucket = database.buckets[bucketIndex];
  ensureBucketOwnership(existingBucket, user);

  const updatedBucket: Bucket = {
    ...existingBucket,
    sharedWith: existingBucket.sharedWith.filter(
      (username) => username !== normalizeUsername(targetUsername)
    ),
    updatedAt: new Date().toISOString(),
  };

  database.buckets[bucketIndex] = updatedBucket;
  await writeDatabase(database);

  return updatedBucket;
}
