import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotePageClient } from "@/components/notes/NotePageClient";

type PageProps = { params: Promise<{ slug: string }> };

export default async function NoteDetailPage({ params }: PageProps) {
  const session = await requireSession();
  const { slug } = await params;

  const note = await prisma.note.findFirst({
    where: { userId: session.id, slug },
    include: {
      outgoing: {
        include: { target: { select: { id: true, title: true, slug: true } } },
      },
      incoming: {
        include: { source: { select: { id: true, title: true, slug: true } } },
      },
    },
  });

  if (!note) notFound();

  return <NotePageClient initialNote={note} />;
}
