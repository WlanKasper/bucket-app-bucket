import { NextResponse } from "next/server";
import { createBucketForUser, listBucketsForUser } from "@/lib/buckets";
import { readSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buckets = await listBucketsForUser(session);
    return NextResponse.json({ buckets });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load buckets",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { name?: string; description?: string };
    const bucket = await createBucketForUser(session, body);
    return NextResponse.json({ bucket }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create bucket",
      },
      { status: 400 }
    );
  }
}
