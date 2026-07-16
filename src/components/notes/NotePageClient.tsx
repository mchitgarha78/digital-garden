"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, ArrowRight } from "lucide-react";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { BacklinksPanel } from "@/components/notes/BacklinksPanel";
import { LocalGraphView } from "@/components/graph/GardenGraph";

type NoteData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  outgoing: Array<{ target: { id: string; title: string; slug: string } }>;
  incoming: Array<{ source: { id: string; title: string; slug: string } }>;
};

export function NotePageClient({ initialNote }: { initialNote: NoteData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content);
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pathQuery, setPathQuery] = useState({ from: "", to: "" });
  const [pathResult, setPathResult] = useState<string[] | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/notes/${note.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setNote(data.note);
        if (data.note.slug !== note.slug) {
          router.replace(`/notes/${data.note.slug}`);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }, [title, content, note.slug, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        save();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, content, note.title, note.content, save]);

  async function handleDelete() {
    if (!confirm("آیا از حذف این یادداشت مطمئن هستید؟")) return;
    await fetch(`/api/notes/${note.slug}`, { method: "DELETE" });
    router.push("/notes");
  }

  async function findPath(method: "bfs" | "cte") {
    if (!pathQuery.from || !pathQuery.to) return;
    const res = await fetch(
      `/api/graph?from=${encodeURIComponent(pathQuery.from)}&to=${encodeURIComponent(pathQuery.to)}&method=${method}`,
    );
    const data = await res.json();
    if (data.path?.path) {
      setPathResult(data.path.path.map((n: { title: string }) => n.title));
    } else {
      setPathResult([]);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">گراف محلی</h3>
          <LocalGraphView slug={note.slug} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <BacklinksPanel incoming={note.incoming} outgoing={note.outgoing} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">یافتن مسیر (BFS / CTE)</h3>
          <div className="space-y-2">
            <input
              value={pathQuery.from}
              onChange={(e) => setPathQuery((p) => ({ ...p, from: e.target.value }))}
              placeholder="slug مبدأ"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              dir="ltr"
            />
            <input
              value={pathQuery.to}
              onChange={(e) => setPathQuery((p) => ({ ...p, to: e.target.value }))}
              placeholder="slug مقصد"
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              dir="ltr"
            />
            <div className="flex gap-2">
              <button
                onClick={() => findPath("bfs")}
                className="flex-1 rounded-lg bg-slate-100 py-1.5 text-xs hover:bg-slate-200"
              >
                BFS
              </button>
              <button
                onClick={() => findPath("cte")}
                className="flex-1 rounded-lg bg-emerald-100 py-1.5 text-xs text-emerald-800 hover:bg-emerald-200"
              >
                CTE
              </button>
            </div>
            {pathResult !== null && (
              <p className="text-xs text-slate-600">
                {pathResult.length === 0
                  ? "مسیر یافت نشد"
                  : pathResult.join(" → ")}
              </p>
            )}
          </div>
        </div>
      </aside>

      <main className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/notes" className="text-sm text-slate-500 hover:text-emerald-700">
            ← بازگشت به لیست
          </Link>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-emerald-600">ذخیره شد</span>}
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "..." : "ذخیره"}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-none bg-transparent text-3xl font-bold text-slate-900 outline-none"
          placeholder="عنوان یادداشت"
        />

        <NoteEditor content={content} onChange={setContent} />

        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-800">
          <p className="flex items-center gap-2 font-medium">
            <ArrowRight className="h-4 w-4" />
            راهنمای لینک‌دهی
          </p>
          <p className="mt-1 text-emerald-700">
            برای اتصال این بذر به یادداشت دیگر، در متن بنویسید:{" "}
            <code className="rounded bg-white px-1.5 py-0.5">[[عنوان یادداشت]]</code>
            — سیستم به‌طور خودکار بک‌لینک ایجاد می‌کند.
          </p>
        </div>
      </main>
    </div>
  );
}
