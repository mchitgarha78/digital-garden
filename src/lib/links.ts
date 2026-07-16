export function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function slugify(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

  return slug || `note-${Date.now()}`;
}

export function extractWikiLinks(content: string): string[] {
  const pattern = /\[\[([^\]]+)\]\]/g;
  const links = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const label = match[1].trim();
    if (label) links.add(label);
  }

  return Array.from(links);
}

export async function resolveNoteTargets(
  userId: string,
  labels: string[],
  excludeNoteId?: string,
) {
  const { prisma } = await import("./prisma");
  const notes = await prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true, slug: true },
  });

  const bySlug = new Map(notes.map((n) => [n.slug.toLowerCase(), n.id]));
  const byTitle = new Map(notes.map((n) => [n.title.toLowerCase(), n.id]));

  const targetIds = new Set<string>();

  for (const label of labels) {
    const key = label.toLowerCase();
    const id = bySlug.get(key) ?? byTitle.get(key);
    if (id && id !== excludeNoteId) {
      targetIds.add(id);
    }
  }

  return Array.from(targetIds);
}

export async function syncNoteLinks(
  noteId: string,
  userId: string,
  content: string,
) {
  const { prisma } = await import("./prisma");
  const labels = extractWikiLinks(content);
  const targetIds = await resolveNoteTargets(userId, labels, noteId);

  await prisma.$transaction([
    prisma.link.deleteMany({ where: { sourceId: noteId } }),
    ...targetIds.map((targetId) =>
      prisma.link.upsert({
        where: {
          sourceId_targetId: { sourceId: noteId, targetId },
        },
        create: { sourceId: noteId, targetId },
        update: {},
      }),
    ),
  ]);

  return targetIds.length;
}

export function renderWikiLinks(content: string): string {
  return content.replace(
    /\[\[([^\]]+)\]\]/g,
    '<a href="/notes/$1" class="wiki-link">[[$1]]</a>',
  );
}
