"use client";

import Link from "next/link";
import { FileText, GitBranch, Sprout, Unlink } from "lucide-react";

type Stats = {
  noteCount: number;
  linkCount: number;
  orphanCount: number;
  avgLinksPerNote: number;
  recentNotes: Array<{
    id: string;
    title: string;
    slug: string;
    updatedAt: string | Date;
  }>;
};

type Orphan = {
  id: string;
  title: string;
  slug: string;
  updatedAt: string | Date;
};

export function DashboardView({
  stats,
  orphans,
}: {
  stats: Stats;
  orphans: Orphan[];
}) {
  const cards = [
    {
      label: "تعداد بذرها",
      value: stats.noteCount,
      icon: Sprout,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "پیوندها",
      value: stats.linkCount,
      icon: GitBranch,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "بذرهای یتیم",
      value: stats.orphanCount,
      icon: Unlink,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "میانگین پیوند",
      value: stats.avgLinksPerNote,
      icon: FileText,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">داشبورد باغ</h1>
        <p className="mt-1 text-slate-500">نمای کلی از شبکه دانش شخصی شما</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">بذرهای یتیم</h2>
          <p className="mb-4 text-sm text-slate-500">
            یادداشت‌هایی که هنوز به شبکه متصل نشده‌اند — فرصتی برای کشف ایده‌های
            فراموش‌شده
          </p>
          {orphans.length === 0 ? (
            <p className="text-sm text-emerald-600">همه بذرها به هم متصل‌اند 🌱</p>
          ) : (
            <ul className="space-y-2">
              {orphans.map((note) => (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.slug}`}
                    className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm transition hover:border-amber-200"
                  >
                    <span className="font-medium text-slate-800">{note.title}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(note.updatedAt).toLocaleDateString("fa-IR")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">آخرین ویرایش‌ها</h2>
          {stats.recentNotes.length === 0 ? (
            <p className="text-sm text-slate-400">هنوز یادداشتی ندارید</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentNotes.map((note) => (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.slug}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 text-sm transition hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-800">{note.title}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(note.updatedAt).toLocaleDateString("fa-IR")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
