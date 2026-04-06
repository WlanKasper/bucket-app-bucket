import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/session";
import { verifyTelegramInitData } from "@/lib/telegram-auth";
import { upsertUser } from "@/lib/buckets";
import { createLocalDevUser, isLocalDevRequest } from "@/lib/dev-user";
import type { SessionUser } from "@/lib/types";

interface SessionRequestBody {
  initDataRaw?: string;
  devUser?: Partial<SessionUser>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SessionRequestBody;

    let user;

    if (body.initDataRaw) {
      user = verifyTelegramInitData(body.initDataRaw);
    } else if (isLocalDevRequest(request)) {
      user = createLocalDevUser(body.devUser);
    } else {
      return NextResponse.json(
        { error: "Telegram init data is required in production" },
        { status: 401 }
      );
    }

    await upsertUser(user);
    const token = await createSessionToken(user);
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create session",
      },
      { status: 400 }
    );
  }
}
