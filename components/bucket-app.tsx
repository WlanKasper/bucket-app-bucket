"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Bucket, BucketItem, SessionUser } from "@/lib/types";

interface BootstrapResponse { user: SessionUser; }
interface BucketsResponse { buckets: Bucket[]; }

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
  return { ...bucket, items: bucket.items.map((i) => ({ ...i })), sharedWith: [...bucket.sharedWith] };
}

export function BucketApp() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Bucket | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>("Connecting…");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

  const isDirtyRef = useRef(false);
  const lastEditTimeRef = useRef<number>(0);
  const selectedBucketIdRef = useRef<string | null>(null);

  useEffect(() => { selectedBucketIdRef.current = selectedBucketId; }, [selectedBucketId]);

  const selectedBucket = useMemo(
    () => buckets.find((b) => b.id === selectedBucketId) ?? null,
    [buckets, selectedBucketId]
  );
  const isOwner = selectedBucket?.ownerTelegramId === user?.telegramUserId;

  // ── Telegram safe-area insets ──────────────────────────
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
    const timer = setTimeout(applyInsets, 350);
    wa.onEvent?.("safeAreaChanged", applyInsets);
    wa.onEvent?.("contentSafeAreaChanged", applyInsets);
    return () => {
      clearTimeout(timer);
      wa.offEvent?.("safeAreaChanged", applyInsets);
      wa.offEvent?.("contentSafeAreaChanged", applyInsets);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Data functions ─────────────────────────────────────
  async function refreshBuckets(nextSelectedId?: string | null) {
    try {
      const res = await fetch("/api/buckets", { cache: "no-store" });
      const data = (await res.json()) as BucketsResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unable to load buckets");
      setBuckets(data.buckets);
      const targetId = nextSelectedId !== undefined ? nextSelectedId : selectedBucketIdRef.current;
      const resolved = data.buckets.find((b) => b.id === targetId) ?? data.buckets[0] ?? null;
      setSelectedBucketId(resolved?.id ?? null);
      isDirtyRef.current = false;
      setDraft(cloneBucket(resolved));
    } catch {
      // silent on background refresh
    }
  }

  async function bootstrap() {
    setIsBootstrapping(true);
    setStatus("Connecting…");
    setStatusTone("neutral");
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getTelegramBootstrapPayload()),
      });
      const data = (await res.json()) as BootstrapResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unable to start session");
      setUser(data.user);
      await refreshBuckets();
      setStatus(data.user.isDev ? "Dev mode active" : "");
      setStatusTone("success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to start session");
      setStatusTone("error");
    } finally {
      setIsBootstrapping(false);
    }
  }

  useEffect(() => { void bootstrap(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync draft when selected bucket changes from server
  useEffect(() => {
    if (!isDirtyRef.current) setDraft(cloneBucket(selectedBucket));
  }, [selectedBucket]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 60s (skip if edited in last 3s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastEditTimeRef.current > 3000) void refreshBuckets();
    }, 60_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateDraft(updater: (current: Bucket) => Bucket) {
    isDirtyRef.current = true;
    lastEditTimeRef.current = Date.now();
    setDraft((current) => (current ? updater(current) : current));
  }

  // Auto-save: debounced 1.5s after last change
  useEffect(() => {
    if (!isDirtyRef.current) return;
    const timer = setTimeout(() => { if (isDirtyRef.current) void saveBucket(); }, 1500);
    return () => clearTimeout(timer);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveBucket() {
    if (!draft || !isDirtyRef.current) return;
    isDirtyRef.current = false;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/buckets/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name, description: draft.description, items: draft.items }),
      });
      const data = (await res.json()) as { bucket?: Bucket; error?: string };
      if (!res.ok || !data.bucket) throw new Error(data.error ?? "Unable to save");
      setBuckets((cur) => cur.map((b) => (b.id === data.bucket?.id ? data.bucket! : b)));
      setStatus("✓");
      setStatusTone("success");
      setTimeout(() => setStatus(""), 1500);
    } catch (error) {
      isDirtyRef.current = true;
      setStatus(error instanceof Error ? error.message : "Save failed");
      setStatusTone("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function createBucket() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled", description: "" }),
      });
      const data = (await res.json()) as { bucket?: Bucket; error?: string };
      if (!res.ok || !data.bucket) throw new Error(data.error ?? "Unable to create bucket");
      await refreshBuckets(data.bucket.id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create bucket");
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
      if (!res.ok) throw new Error(data.error ?? "Unable to delete");
      await refreshBuckets(null);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete");
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
      <div className={`status-bar ${statusTone === "error" ? "error" : statusTone === "success" ? "success" : ""}`}>
        {status}
      </div>

      <div className="app-scroll">
        {draft ? (
          <>
            {/* Title row: name + delete icon */}
            <div className="bucket-title-row">
              <input
                className="bucket-name-input"
                value={draft.name}
                onChange={(e) => updateDraft((c) => ({ ...c, name: e.target.value }))}
                placeholder="Untitled"
              />
              {isOwner && (
                <button
                  className="bucket-delete-btn"
                  type="button"
                  onClick={() => void deleteBucket()}
                  disabled={isSaving}
                  aria-label="Delete bucket"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 5h12M7.5 5V3.5h3V5M6 5l.75 10.5h4.5L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Checklist */}
            <div className="checklist">
              {draft.items.map((item) => (
                <div className="item-row" key={item.id}>
                  <button
                    className={`item-check ${item.checked ? "checked" : ""}`}
                    type="button"
                    onClick={() =>
                      updateDraft((c) => ({
                        ...c,
                        items: c.items.map((e) => e.id === item.id ? { ...e, checked: !e.checked } : e),
                      }))
                    }
                  />
                  <input
                    className={`item-text ${item.checked ? "checked-text" : ""}`}
                    value={item.text}
                    onChange={(e) =>
                      updateDraft((c) => ({
                        ...c,
                        items: c.items.map((entry) => entry.id === item.id ? { ...entry, text: e.target.value } : entry),
                      }))
                    }
                    placeholder="Add a note…"
                  />
                  <button
                    className="item-remove"
                    type="button"
                    onClick={() => updateDraft((c) => ({ ...c, items: c.items.filter((e) => e.id !== item.id) }))}
                  >
                    ×
                  </button>
                </div>
              ))}
              {draft.items.length === 0 && <p className="empty-items">Tap + to add your first item</p>}
            </div>

            <button
              className="add-item-btn"
              type="button"
              onClick={() => updateDraft((c) => ({ ...c, items: [...c.items, createEmptyItem()] }))}
            >
              + Add item
            </button>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No buckets yet</div>
            <p className="empty-state-subtitle">Tap + below to create your first one.</p>
            <button className="btn btn-primary" onClick={() => void createBucket()} disabled={isSaving} type="button">
              Create bucket
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
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
            <span style={{ color: "var(--muted)", fontSize: "0.9rem", alignSelf: "center" }}>No buckets yet</span>
          )}
        </div>
      </div>
    </main>
  );
}
