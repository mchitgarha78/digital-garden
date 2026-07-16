import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserFromRequest } from "@/lib/auth";
import { jsonError, notFound, unauthorized } from "@/lib/api";
import { slugify, syncNoteLinks } from "@/lib/links";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
});

export async function GET(request: Request, context: RouteContext) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { slug } = await context.params;

  const note = await prisma.note.findFirst({
    where: { userId: user.id, slug },
    include: {
      outgoing: {
        include: { target: { select: { id: true, title: true, slug: true } } },
      },
      incoming: {
        include: { source: { select: { id: true, title: true, slug: true } } },
      },
    },
  });

  if (!note) return notFound("یادداشت یافت نشد");

  return NextResponse.json({ note });
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { slug } = await context.params;

  try {
    const existing = await prisma.note.findFirst({
      where: { userId: user.id, slug },
    });
    if (!existing) return notFound("یادداشت یافت نشد");

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "داده نامعتبر");
    }

    const data: {
      title?: string;
      slug?: string;
      content?: string;
      posX?: number;
      posY?: number;
    } = {};

    if (parsed.data.title !== undefined) {
      data.title = parsed.data.title;
      if (parsed.data.title !== existing.title) {
        let newSlug = slugify(parsed.data.title);
        const conflict = await prisma.note.findFirst({
          where: {
            userId: user.id,
            slug: newSlug,
            NOT: { id: existing.id },
          },
        });
        if (conflict) {
          newSlug = `${newSlug}-${Date.now().toString(36)}`;
        }
        data.slug = newSlug;
      }
    }

    if (parsed.data.content !== undefined) data.content = parsed.data.content;
    if (parsed.data.posX !== undefined) data.posX = parsed.data.posX;
    if (parsed.data.posY !== undefined) data.posY = parsed.data.posY;

    const note = await prisma.note.update({
      where: { id: existing.id },
      data,
      include: {
        outgoing: {
          include: { target: { select: { id: true, title: true, slug: true } } },
        },
        incoming: {
          include: { source: { select: { id: true, title: true, slug: true } } },
        },
      },
    });

    if (parsed.data.content !== undefined) {
      await syncNoteLinks(note.id, user.id, parsed.data.content);
    }

    const refreshed = await prisma.note.findUnique({
      where: { id: note.id },
      include: {
        outgoing: {
          include: { target: { select: { id: true, title: true, slug: true } } },
        },
        incoming: {
          include: { source: { select: { id: true, title: true, slug: true } } },
        },
      },
    });

    return NextResponse.json({ note: refreshed });
  } catch {
    return jsonError("خطا در به‌روزرسانی یادداشت", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { slug } = await context.params;

  const existing = await prisma.note.findFirst({
    where: { userId: user.id, slug },
  });
  if (!existing) return notFound("یادداشت یافت نشد");

  await prisma.note.delete({ where: { id: existing.id } });

  return NextResponse.json({ ok: true });
}
