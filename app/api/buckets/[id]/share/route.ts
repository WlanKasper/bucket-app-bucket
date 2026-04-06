import { NextResponse } from "next/server";
import {
  shareBucketWithUsername,
  unshareBucketWithUsername,
} from "@/lib/buckets";
import { readSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: {
    id: string;
  };
}

interface ShareRequestBody {
  username?: string;
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ShareRequestBody;
    const bucket = await shareBucketWithUsername(params.id, session, body.username ?? "");
    return NextResponse.json({ bucket });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to share bucket",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await readSessionCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ShareRequestBody;
    const bucket = await unshareBucketWithUsername(params.id, session, body.username ?? "");
    return NextResponse.json({ bucket });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to remove access",
      },
      { status: 400 }
    );
  }
}
