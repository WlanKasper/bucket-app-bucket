import { NextResponse } from "next/server";
import {
  deleteBucketForUser,
  getBucketForUser,
  updateBucketForUser,
} from "@/lib/buckets";
import { readSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bucket = await getBucketForUser(params.id, session);
    return NextResponse.json({ bucket });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load bucket",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name?: unknown;
      description?: unknown;
      items?: unknown;
    };

    const bucket = await updateBucketForUser(params.id, session, body);
    return NextResponse.json({ bucket });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update bucket",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteBucketForUser(params.id, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to delete bucket",
      },
      { status: 400 }
    );
  }
}
