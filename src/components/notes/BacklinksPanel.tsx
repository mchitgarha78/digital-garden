"use client";

import Link from "next/link";
import { ArrowLeft, Link2 } from "lucide-react";

type LinkedNote = {
  id: string;
  title: string;
  slug: string;
};

type BacklinksPanelProps = {
  incoming: Array<{ source: LinkedNote }>;
  outgoing: Array<{ target: LinkedNote }>;
};

export function BacklinksPanel({ incoming, outgoing }: BacklinksPanelProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Link2 className="h-4 w-4 text-emerald-600" />
          بک‌لینک‌ها ({incoming.length})
        </h3>
        {incoming.length === 0 ? (
          <p className="text-sm text-slate-400">هنوز بک‌لینکی وجود ندارد</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map(({ source }) => (
              <li key={source.id}>
                <Link
                  href={`/notes/${source.slug}`}
                  className="block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ArrowLeft className="h-3 w-3" />
                    {source.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Link2 className="h-4 w-4 rotate-180 text-emerald-600" />
          لینک‌های خروجی ({outgoing.length})
        </h3>
        {outgoing.length === 0 ? (
          <p className="text-sm text-slate-400">
            از [[عنوان]] در متن برای ایجاد لینک استفاده کنید
          </p>
        ) : (
          <ul className="space-y-2">
            {outgoing.map(({ target }) => (
              <li key={target.id}>
                <Link
                  href={`/notes/${target.slug}`}
                  className="block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  {target.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
