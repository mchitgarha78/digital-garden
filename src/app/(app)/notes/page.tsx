import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NotesListPage() {
  const session = await requireSession();

  const notes = await prisma.note.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      _count: { select: { outgoing: true, incoming: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">یادداشت‌ها</h1>
          <p className="text-slate-500">{notes.length} بذر در باغ شما</p>
        </div>
        <Link
          href="/notes/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          بذر جدید
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-slate-500">هنوز یادداشتی ندارید</p>
          <Link href="/notes/new" className="mt-4 inline-block text-emerald-700 hover:underline">
            اولین بذر را بکارید →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.slug}`}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div>
                <h2 className="font-semibold text-slate-900">{note.title}</h2>
                <p className="text-xs text-slate-400" dir="ltr">
                  /{note.slug}
                </p>
              </div>
              <div className="text-left text-xs text-slate-500">
                <p>{note._count.outgoing} لینک خروجی</p>
                <p>{note._count.incoming} بک‌لینک</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
