# Bucket release target

This directory is now the production deployment target for Bucket.

## What changed

- the old Vite + Redux-Saga frontend is replaced by a single **Next.js** app
- the old NestJS + Mongo + Socket.IO backend is replaced by **Vercel API routes + Supabase**
- Telegram mini-app entry stays intact
- realtime presence is intentionally removed for the first production release

## Required services

1. **Vercel** for hosting
2. **Supabase** for Postgres
3. A **Telegram bot token** so the server can verify Telegram Web App init data

## Environment variables

Set these in Vercel for the `bucket-app-bucket` project:

| Variable | Purpose |
| --- | --- |
| `STORAGE_DRIVER` | `supabase` for production, `file` for self-contained local/agent runs |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server-side key |
| `SESSION_SECRET` | Random secret used to sign session cookies |
| `TELEGRAM_BOT_TOKEN` | Bot token used to verify Telegram init data |

For local development you can copy `.env.example` to `.env.local`.

## Supabase setup

Run the SQL in `supabase/schema.sql`.

That creates:
- `users`
- `buckets`

`buckets.items` stores the checklist payload as JSONB and `buckets.shared_with` stores Telegram usernames as a text array.

For local Docker development with the Supabase CLI:

```bash
npm run supabase:start
npm run supabase:reset
```

## Local development

```bash
npm install
npm run dev
npm run smoke
```

When the app is opened on `localhost` outside Telegram, the server creates a fake Telegram account automatically so the UI can still be tested.

Default localhost dev account:

| Field | Value |
| --- | --- |
| Telegram ID | `999000001` |
| Username | `bucket_local_dev` |
| First name | `Bucket` |
| Last name | `Local` |

You can override that account in `.env.local` with:
- `DEV_TELEGRAM_USER_ID`
- `DEV_TELEGRAM_USERNAME`
- `DEV_TELEGRAM_FIRST_NAME`
- `DEV_TELEGRAM_LAST_NAME`

### AI-first local mode

The repository now supports two agent-friendly local modes:

- `STORAGE_DRIVER=file` stores users and buckets in `bucket-app-bucket/.data/bucket-dev-db.json`
- `STORAGE_DRIVER=supabase` runs against local Dockerized Supabase and matches the production architecture
- `npm run smoke` verifies session bootstrap, bucket creation, updating, sharing, collaborator access, unsharing, and deletion against a running local app

For Vercel production, use `STORAGE_DRIVER=supabase`.

## Vercel deployment

1. Import this repository into Vercel.
2. Set the **Root Directory** to `bucket-app-bucket`.
3. Add the environment variables listed above.
4. Set `STORAGE_DRIVER=supabase`.
5. Deploy.

## Legacy backend

`bucket-be-bucket` is no longer part of the production deployment path for this release.
