"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bucket, BucketItem, SessionUser } from "@/lib/types";

interface BootstrapResponse {
  user: SessionUser;
}

interface BucketsResponse {
  buckets: Bucket[];
}

function getTelegramBootstrapPayload(): { initDataRaw?: string } {
  if (typeof window === "undefined") return {};
  const webApp = window.Telegram?.WebApp;
  if (webApp?.initData) {
    webApp.ready();
    webApp.expand();
    webApp.requestFullscreen?.();
    return { initDataRaw: webApp.initData };
  }
  return {};
}


function createEmptyItem(): BucketItem {
  return { id: crypto.randomUUID(), text: "", checked: false };
}

function cloneBucket(bucket: Bucket | null): Bucket | null {
  if (!bucket) return null;
  return {
    ...bucket,
    items: bucket.items.map((item) => ({ ...item })),
    sharedWith: [...bucket.sharedWith],
  };
}


export function BucketApp() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Bucket | null>(null);
  const [shareUsername, setShareUsername] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>("Connecting…");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

  const selectedBucket = useMemo(
    () => buckets.find((b) => b.id === selectedBucketId) ?? null,
    [buckets, selectedBucketId]
  );

  const isOwner = selectedBucket?.ownerTelegramId === user?.telegramUserId;
  async function bootstrap() {
    setIsBootstrapping(true);
    setStatus("Connecting…");
    setStatusTone("neutral");
    try {
      const payload = getTelegramBootstrapPayload();
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as BootstrapResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unable to start session");
      setUser(data.user);
      await refreshBuckets();
      setStatus(data.user.isDev ? "Dev mode active" : "Telegram session verified");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start session");
      setStatusTone("error");
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function refreshBuckets(nextSelectedId?: string | null) {
    const res = await fetch("/api/buckets", { cache: "no-store" });
    const data = (await res.json()) as BucketsResponse & { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Unable to load buckets");
    setBuckets(data.buckets);
    const targetId = nextSelectedId ?? selectedBucketId ?? data.buckets[0]?.id ?? null;
    const resolved = data.buckets.find((b) => b.id === targetId) ?? data.buckets[0] ?? null;
    setSelectedBucketId(resolved?.id ?? null);
    setDraft(cloneBucket(resolved));
  }

  useEffect(() => { void bootstrap(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dynamically apply Telegram safe area insets — runs after fullscreen activates
  useEffect(() => {
    const wa = window.Telegram?.WebApp;
    if (!wa) return;

    function applyInsets() {
      const top = wa?.contentSafeAreaInset?.top ?? wa?.safeAreaInset?.top ?? 0;
      const bottom = wa?.safeAreaInset?.bottom ?? 0;
      document.documentElement.style.setProperty("--safe-top", `${top}px`);
      document.documentElement.style.setProperty("--safe-bottom", `${bottom}px`);
    }

    applyInsets();
    // Re-read after fullscreen animation completes (~300ms)
    const timer = setTimeout(applyInsets, 350);
    wa.onEvent?.("safeAreaChanged", applyInsets);
    wa.onEvent?.("contentSafeAreaChanged", applyInsets);

    return () => {
      clearTimeout(timer);
      wa.offEvent?.("safeAreaChanged", applyInsets);
      wa.offEvent?.("contentSafeAreaChanged", applyInsets);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setDraft(cloneBucket(selectedBucket)); }, [selectedBucket]);

  function updateDraft(updater: (current: Bucket) => Bucket) {
    setDraft((current) => (current ? updater(current) : current));
  }

  async function createBucket() {
    setIsSaving(true);
    setStatus("Creating bucket…");
    setStatusTone("neutral");
    try {
      const res = await fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled", description: "" }),
      });
      const data = (await res.json()) as { bucket?: Bucket; error?: string };
      if (!res.ok || !data.bucket) throw new Error(data.error ?? "Unable to create bucket");
      await refreshBuckets(data.bucket.id);
      setStatus("Bucket created");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create bucket");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveBucket() {
    if (!draft) return;
    setIsSaving(true);
    setStatus("Saving…");
    setStatusTone("neutral");
    try {
      const res = await fetch(`/api/buckets/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name, description: draft.description, items: draft.items }),
      });
      const data = (await res.json()) as { bucket?: Bucket; error?: string };
      if (!res.ok || !data.bucket) throw new Error(data.error ?? "Unable to save bucket");
      setBuckets((current) => current.map((b) => (b.id === data.bucket?.id ? data.bucket! : b)));
      setDraft(cloneBucket(data.bucket));
      setStatus("Saved");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBucket() {
    if (!draft) return;
    if (!window.confirm(`Delete "${draft.name}"?`)) return;
    setIsSaving(true);
    setStatus("Deleting…");
    setStatusTone("neutral");
    try {
      const res = await fetch(`/api/buckets/${draft.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unable to delete bucket");
      await refreshBuckets(null);
      setStatus("Bucket deleted");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function shareBucket() {
    if (!draft || !shareUsername.trim()) return;
    setIsSaving(true);
    setStatus("Sharing…");
    setStatusTone("neutral");
    try {
      const res = await fetch(`/api/buckets/${draft.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: shareUsername }),
      });
      const data = (await res.json()) as { bucket?: Bucket; error?: string };
      if (!res.ok || !data.bucket) throw new Error(data.error ?? "Unable to share");
      setBuckets((current) => current.map((b) => (b.id === data.bucket?.id ? data.bucket! : b)));
      setDraft(cloneBucket(data.bucket));
      setShareUsername("");
      setStatus("Shared");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to share");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function unshareBucket(username: string) {
    if (!draft) return;
    setIsSaving(true);
    setStatus("Removing access…");
    setStatusTone("neutral");
    try {
      const res = await fetch(`/api/buckets/${draft.id}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = (await res.json()) as { bucket?: Bucket; error?: string };
      if (!res.ok || !data.bucket) throw new Error(data.error ?? "Unable to remove access");
      setBuckets((current) => current.map((b) => (b.id === data.bucket?.id ? data.bucket! : b)));
      setDraft(cloneBucket(data.bucket));
      setStatus("Access removed");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to remove access");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isBootstrapping) {
    return (
      <div className="app-loading">
        <div className="app-loading-title">Bucket</div>
        <div className="app-loading-subtitle">{status}</div>
      </div>
    );
  }

  return (
    <main className="app">
      {/* Tab bar: + button + bucket tabs */}
      <div className="tab-bar">
        <button className="add-bucket-btn" onClick={() => void createBucket()} disabled={isSaving} title="New bucket">
          +
        </button>
        <div className="tabs-scroll">
          {buckets.map((bucket) => (
            <button
              key={bucket.id}
              className={`tab-btn ${bucket.id === selectedBucketId ? "active" : ""}`}
              onClick={() => setSelectedBucketId(bucket.id)}
              type="button"
            >
              {bucket.name || "Untitled"}
            </button>
          ))}
          {buckets.length === 0 && (
            <span style={{ color: "var(--muted)", fontSize: "0.9rem", alignSelf: "center" }}>
              No buckets yet
            </span>
          )}
        </div>
      </div>

      {/* Status message */}
      <div className={`status-bar ${statusTone === "error" ? "error" : statusTone === "success" ? "success" : ""}`}>
        {status}
      </div>

      {/* Content */}
      {draft ? (
        <>
          {/* Checklist card */}
          <div className="bucket-card">
            <div className="card-section">
              <div className="card-section-header">
                <span className="card-section-title">Checklist</span>
              </div>

              <div className="checklist">
                {draft.items.map((item) => (
                  <div className="item-row" key={item.id}>
                    <button
                      className={`item-check ${item.checked ? "checked" : ""}`}
                      type="button"
                      onClick={() =>
                        updateDraft((c) => ({
                          ...c,
                          items: c.items.map((e) =>
                            e.id === item.id ? { ...e, checked: !e.checked } : e
                          ),
                        }))
                      }
                    />
                    <input
                      className={`item-text ${item.checked ? "checked-text" : ""}`}
                      value={item.text}
                      onChange={(e) =>
                        updateDraft((c) => ({
                          ...c,
                          items: c.items.map((entry) =>
                            entry.id === item.id ? { ...entry, text: e.target.value } : entry
                          ),
                        }))
                      }
                      placeholder="Write a note or checklist item"
                    />
                    <button
                      className="item-remove"
                      type="button"
                      onClick={() =>
                        updateDraft((c) => ({ ...c, items: c.items.filter((e) => e.id !== item.id) }))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                {draft.items.length === 0 && (
                  <p className="empty-items">No items yet</p>
                )}
              </div>

              <button
                className="add-item-btn"
                type="button"
                onClick={() => updateDraft((c) => ({ ...c, items: [...c.items, createEmptyItem()] }))}
              >
                + Add item
              </button>
            </div>

            {/* Sharing section */}
            <div className="card-section">
              <div className="card-section-header">
                <span className="card-section-title">Sharing</span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {isOwner ? "Owner" : `Shared by @${draft.ownerUsername}`}
                </span>
              </div>

              {isOwner ? (
                <>
                  <div className="share-row">
                    <input
                      className="share-input"
                      value={shareUsername}
                      onChange={(e) => setShareUsername(e.target.value)}
                      placeholder="@telegram_username"
                      onKeyDown={(e) => { if (e.key === "Enter") void shareBucket(); }}
                    />
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "10px 16px", flexShrink: 0 }}
                      onClick={() => void shareBucket()}
                      disabled={isSaving || !shareUsername.trim()}
                      type="button"
                    >
                      Share
                    </button>
                  </div>
                  {draft.sharedWith.length > 0 && (
                    <div className="chip-list">
                      {draft.sharedWith.map((username) => (
                        <span key={username} className="chip">
                          @{username}
                          <button
                            className="chip-remove"
                            type="button"
                            onClick={() => void unshareBucket(username)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="shared-with-me">
                  You can edit the content but only the owner can manage access.
                </p>
              )}
            </div>
          </div>

          {/* Bucket name — bottom */}
          <div className="bucket-name-bar">
            <input
              className="bucket-name-input"
              value={draft.name}
              onChange={(e) => updateDraft((c) => ({ ...c, name: e.target.value }))}
              placeholder="Untitled"
            />
          </div>

          {/* Action bar */}
          <div className="action-bar">
            <button
              className="btn btn-ghost"
              onClick={() => void refreshBuckets(draft.id)}
              disabled={isSaving}
              type="button"
            >
              ↺
            </button>
            <button
              className="btn btn-primary"
              onClick={() => void saveBucket()}
              disabled={isSaving}
              type="button"
            >
              Save changes
            </button>
            {isOwner && (
              <button
                className="btn btn-danger"
                onClick={() => void deleteBucket()}
                disabled={isSaving}
                type="button"
              >
                Delete
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-title">Create your first bucket</div>
          <p className="empty-state-subtitle">
            Tap + to create a shared checklist or notes list.
          </p>
          <button className="btn btn-primary" onClick={() => void createBucket()} disabled={isSaving} type="button">
            Create bucket
          </button>
        </div>
      )}
    </main>
  );
}
