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
  if (typeof window === "undefined") {
    return {};
  }

  const webApp = window.Telegram?.WebApp;
  if (webApp?.initData) {
    webApp.ready();
    webApp.expand();
    return { initDataRaw: webApp.initData };
  }

  return {};
}

function createEmptyItem(): BucketItem {
  return {
    id: crypto.randomUUID(),
    text: "",
    checked: false,
  };
}

function cloneBucket(bucket: Bucket | null): Bucket | null {
  if (!bucket) {
    return null;
  }

  return {
    ...bucket,
    items: bucket.items.map((item) => ({ ...item })),
    sharedWith: [...bucket.sharedWith],
  };
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Unknown update time";
  }

  return date.toLocaleString();
}

export function BucketApp() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Bucket | null>(null);
  const [shareUsername, setShareUsername] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>("Connecting to Bucket...");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

  const selectedBucket = useMemo(
    () => buckets.find((bucket) => bucket.id === selectedBucketId) ?? null,
    [buckets, selectedBucketId]
  );

  const isOwner = selectedBucket?.ownerTelegramId === user?.telegramUserId;

  async function bootstrap() {
    setIsBootstrapping(true);
    setStatus("Connecting to Bucket...");
    setStatusTone("neutral");

    try {
      const payload = getTelegramBootstrapPayload();
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as BootstrapResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start session");
      }

      setUser(data.user);
      await refreshBuckets();
      setStatus(data.user.isDev ? "Dev mode session active." : "Telegram session verified.");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start session");
      setStatusTone("error");
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function refreshBuckets(nextSelectedId?: string | null) {
    const response = await fetch("/api/buckets", { cache: "no-store" });
    const data = (await response.json()) as BucketsResponse & { error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load buckets");
    }

    setBuckets(data.buckets);

    const targetId =
      nextSelectedId ??
      selectedBucketId ??
      data.buckets[0]?.id ??
      null;

    const resolvedBucket = data.buckets.find((bucket) => bucket.id === targetId) ?? data.buckets[0] ?? null;
    setSelectedBucketId(resolvedBucket?.id ?? null);
    setDraft(cloneBucket(resolvedBucket));
  }

  useEffect(() => {
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDraft(cloneBucket(selectedBucket));
  }, [selectedBucket]);

  async function createBucket() {
    setIsSaving(true);
    setStatus("Creating bucket...");
    setStatusTone("neutral");

    try {
      const response = await fetch("/api/buckets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Untitled bucket",
          description: "",
        }),
      });

      const data = (await response.json()) as { bucket?: Bucket; error?: string };
      if (!response.ok || !data.bucket) {
        throw new Error(data.error ?? "Unable to create bucket");
      }

      await refreshBuckets(data.bucket.id);
      setStatus("Bucket created.");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create bucket");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveBucket() {
    if (!draft) {
      return;
    }

    setIsSaving(true);
    setStatus("Saving changes...");
    setStatusTone("neutral");

    try {
      const response = await fetch(`/api/buckets/${draft.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          items: draft.items,
        }),
      });

      const data = (await response.json()) as { bucket?: Bucket; error?: string };
      if (!response.ok || !data.bucket) {
        throw new Error(data.error ?? "Unable to save bucket");
      }

      setBuckets((current) =>
        current.map((bucket) => (bucket.id === data.bucket?.id ? data.bucket : bucket))
      );
      setDraft(cloneBucket(data.bucket));
      setStatus("Changes saved.");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save bucket");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBucket() {
    if (!draft) {
      return;
    }

    const confirmed = window.confirm(`Delete "${draft.name}"?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setStatus("Deleting bucket...");
    setStatusTone("neutral");

    try {
      const response = await fetch(`/api/buckets/${draft.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete bucket");
      }

      await refreshBuckets(null);
      setStatus("Bucket deleted.");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete bucket");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function shareBucket() {
    if (!draft || !shareUsername.trim()) {
      return;
    }

    setIsSaving(true);
    setStatus("Updating sharing...");
    setStatusTone("neutral");

    try {
      const response = await fetch(`/api/buckets/${draft.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: shareUsername,
        }),
      });

      const data = (await response.json()) as { bucket?: Bucket; error?: string };
      if (!response.ok || !data.bucket) {
        throw new Error(data.error ?? "Unable to share bucket");
      }

      setBuckets((current) =>
        current.map((bucket) => (bucket.id === data.bucket?.id ? data.bucket : bucket))
      );
      setDraft(cloneBucket(data.bucket));
      setShareUsername("");
      setStatus("Bucket shared.");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to share bucket");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function unshareBucket(username: string) {
    if (!draft) {
      return;
    }

    setIsSaving(true);
    setStatus("Updating sharing...");
    setStatusTone("neutral");

    try {
      const response = await fetch(`/api/buckets/${draft.id}/share`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
        }),
      });

      const data = (await response.json()) as { bucket?: Bucket; error?: string };
      if (!response.ok || !data.bucket) {
        throw new Error(data.error ?? "Unable to remove access");
      }

      setBuckets((current) =>
        current.map((bucket) => (bucket.id === data.bucket?.id ? data.bucket : bucket))
      );
      setDraft(cloneBucket(data.bucket));
      setStatus("Share removed.");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to remove access");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  function updateDraft(updater: (current: Bucket) => Bucket) {
    setDraft((current) => (current ? updater(current) : current));
  }

  if (isBootstrapping) {
    return (
      <main className="shell">
        <section className="panel content empty-state">
          <div>
            <p className="badge">Booting release build</p>
            <h1 className="title">Bucket</h1>
            <p className="subtitle">{status}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <aside className="panel sidebar">
        <div className="header-row">
          <div>
            <p className="badge">{user?.isDev ? "Local dev mode" : "Telegram mini-app"}</p>
            <h1 className="title">Bucket</h1>
          </div>
          <button className="button secondary" onClick={() => void createBucket()} disabled={isSaving}>
            New bucket
          </button>
        </div>

        <p className="subtitle">
          Signed in as <strong>@{user?.username}</strong>
        </p>

        <div className="list">
          {buckets.map((bucket) => (
            <button
              key={bucket.id}
              className={`bucket-button ${bucket.id === selectedBucketId ? "active" : ""}`}
              onClick={() => setSelectedBucketId(bucket.id)}
              type="button"
            >
              <span className="bucket-name">{bucket.name}</span>
              <span className="bucket-meta">
                {bucket.items.filter((item) => item.checked).length}/{bucket.items.length || 0} done
              </span>
            </button>
          ))}
        </div>

        {buckets.length === 0 ? (
          <p className="subtitle">No buckets yet. Create one to start sharing notes.</p>
        ) : null}
      </aside>

      <section className="panel content">
        {draft ? (
          <>
            <div className="header-row">
              <div>
                <p className="badge">Last updated {formatUpdatedAt(draft.updatedAt)}</p>
                <h2 className="title">{draft.name || "Untitled bucket"}</h2>
              </div>
              <div className="toolbar">
                <button className="button secondary" onClick={() => void refreshBuckets(draft.id)} disabled={isSaving}>
                  Refresh
                </button>
                <button className="button" onClick={() => void saveBucket()} disabled={isSaving}>
                  Save changes
                </button>
                {isOwner ? (
                  <button className="button danger" onClick={() => void deleteBucket()} disabled={isSaving}>
                    Delete
                  </button>
                ) : null}
              </div>
            </div>

            <div className={`status ${statusTone === "error" ? "error" : statusTone === "success" ? "success" : ""}`}>
              {status}
            </div>

            <div className="editor-grid">
              <section className="section">
                <div className="section-header">
                  <strong>Details</strong>
                  <span className="muted">
                    Owner: @{draft.ownerUsername}
                  </span>
                </div>
                <div className="editor-grid">
                  <input
                    className="field"
                    value={draft.name}
                    onChange={(event) =>
                      updateDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Bucket name"
                  />
                  <textarea
                    className="textarea"
                    value={draft.description}
                    onChange={(event) =>
                      updateDraft((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Describe this bucket"
                  />
                </div>
              </section>

              <section className="section">
                <div className="section-header">
                  <strong>Checklist</strong>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        items: [...current.items, createEmptyItem()],
                      }))
                    }
                  >
                    Add item
                  </button>
                </div>

                <div className="checklist">
                  {draft.items.map((item) => (
                    <div className="item-row" key={item.id}>
                      <input
                        className="item-checkbox"
                        type="checkbox"
                        checked={item.checked}
                        onChange={(event) =>
                          updateDraft((current) => ({
                            ...current,
                            items: current.items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, checked: event.target.checked }
                                : entry
                            ),
                          }))
                        }
                      />
                      <input
                        className="item-input"
                        value={item.text}
                        onChange={(event) =>
                          updateDraft((current) => ({
                            ...current,
                            items: current.items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, text: event.target.value }
                                : entry
                            ),
                          }))
                        }
                        placeholder="Write a note or checklist item"
                      />
                      <button
                        className="button ghost"
                        type="button"
                        onClick={() =>
                          updateDraft((current) => ({
                            ...current,
                            items: current.items.filter((entry) => entry.id !== item.id),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {draft.items.length === 0 ? (
                    <p className="subtitle">No items yet. Add the first one.</p>
                  ) : null}
                </div>
              </section>

              <section className="section">
                <div className="section-header">
                  <strong>Sharing</strong>
                  <span className="muted">
                    {isOwner ? "Owner-managed" : "Shared with you"}
                  </span>
                </div>

                {isOwner ? (
                  <>
                    <div className="share-row">
                      <input
                        className="share-input"
                        value={shareUsername}
                        onChange={(event) => setShareUsername(event.target.value)}
                        placeholder="@telegram_username"
                      />
                      <button className="button secondary" type="button" onClick={() => void shareBucket()}>
                        Share
                      </button>
                    </div>

                    <div className="chip-list">
                      {draft.sharedWith.map((username) => (
                        <span key={username} className="chip">
                          @{username}
                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => void unshareBucket(username)}
                          >
                            Remove
                          </button>
                        </span>
                      ))}

                      {draft.sharedWith.length === 0 ? (
                        <p className="subtitle">No collaborators yet.</p>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="subtitle">
                    This bucket is shared with you. You can edit the content but only the owner can manage access.
                  </p>
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div>
              <p className="badge">Ready</p>
              <h2 className="title">Create your first bucket</h2>
              <p className="subtitle">
                This production release keeps Telegram entry simple and removes the old realtime complexity.
              </p>
              <button className="button" onClick={() => void createBucket()} disabled={isSaving}>
                Create bucket
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
