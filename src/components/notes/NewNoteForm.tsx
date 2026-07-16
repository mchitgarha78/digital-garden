"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export function NewNoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا");
        return;
      }
      router.push(`/notes/${data.note.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">بذر جدید</h1>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <label className="mb-2 block text-sm font-medium text-slate-700">عنوان</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
          placeholder="عنوان اولین ایده..."
        />
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {loading ? "در حال ایجاد..." : "ایجاد"}
          </button>
          <Link
            href="/notes"
            className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  );
}
