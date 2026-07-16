import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserFromRequest } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/api";
import { slugify, syncNoteLinks } from "@/lib/links";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  content: z.string().optional(),
});

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      _count: { select: { outgoing: true, incoming: true } },
    },
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "داده نامعتبر");
    }

    const { title, content = "" } = parsed.data;
    let slug = slugify(title);

    const existing = await prisma.note.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const noteCount = await prisma.note.count({ where: { userId: user.id } });

    const note = await prisma.note.create({
      data: {
        title,
        slug,
        content,
        userId: user.id,
        posX: (noteCount % 5) * 220,
        posY: Math.floor(noteCount / 5) * 160,
      },
    });

    await syncNoteLinks(note.id, user.id, content);

    return NextResponse.json({ note }, { status: 201 });
  } catch {
    return jsonError("خطا در ایجاد یادداشت", 500);
  }
}
