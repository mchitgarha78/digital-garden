import { prisma } from "./prisma";
import { findShortestPath } from "./graph-algorithms";

export type GraphNode = {
  id: string;
  title: string;
  slug: string;
  posX: number;
  posY: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export async function getFullGraph(userId: string): Promise<GraphData> {
  const [notes, links] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      select: { id: true, title: true, slug: true, posX: true, posY: true },
    }),
    prisma.link.findMany({
      where: { source: { userId } },
      select: { id: true, sourceId: true, targetId: true },
    }),
  ]);

  return {
    nodes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      posX: n.posX,
      posY: n.posY,
    })),
    edges: links.map((l) => ({
      id: l.id,
      source: l.sourceId,
      target: l.targetId,
    })),
  };
}

export async function getLocalGraph(
  userId: string,
  slug: string,
): Promise<GraphData | null> {
  const center = await prisma.note.findFirst({
    where: { userId, slug },
    select: { id: true, title: true, slug: true, posX: true, posY: true },
  });

  if (!center) return null;

  const links = await prisma.link.findMany({
    where: {
      OR: [{ sourceId: center.id }, { targetId: center.id }],
      source: { userId },
    },
    select: {
      id: true,
      sourceId: true,
      targetId: true,
      source: { select: { id: true, title: true, slug: true, posX: true, posY: true } },
      target: { select: { id: true, title: true, slug: true, posX: true, posY: true } },
    },
  });

  const nodeMap = new Map<string, GraphNode>();
  nodeMap.set(center.id, {
    id: center.id,
    title: center.title,
    slug: center.slug,
    posX: center.posX,
    posY: center.posY,
  });

  const edges: GraphEdge[] = [];

  for (const link of links) {
    nodeMap.set(link.source.id, {
      id: link.source.id,
      title: link.source.title,
      slug: link.source.slug,
      posX: link.source.posX,
      posY: link.source.posY,
    });
    nodeMap.set(link.target.id, {
      id: link.target.id,
      title: link.target.title,
      slug: link.target.slug,
      posX: link.target.posX,
      posY: link.target.posY,
    });
    edges.push({
      id: link.id,
      source: link.sourceId,
      target: link.targetId,
    });
  }

  return { nodes: Array.from(nodeMap.values()), edges };
}

/** BFS shortest path on an undirected graph. */
export async function findPathBFS(
  userId: string,
  fromSlug: string,
  toSlug: string,
): Promise<{ path: GraphNode[]; distance: number } | null> {
  const notes = await prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true, slug: true, posX: true, posY: true },
  });
  if (!notes.some((note) => note.slug === fromSlug) ||
      !notes.some((note) => note.slug === toSlug)) return null;

  const links = await prisma.link.findMany({
    where: { source: { userId }, target: { userId } },
    select: { sourceId: true, targetId: true },
  });
  return findShortestPath(notes, links, fromSlug, toSlug);
}

/** PostgreSQL recursive CTE for shortest path (undirected) */
export async function findPathRecursiveCTE(
  userId: string,
  fromSlug: string,
  toSlug: string,
): Promise<{ path: GraphNode[]; distance: number; method: string } | null> {
  const notes = await prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true, slug: true, posX: true, posY: true },
  });

  const noteById = new Map(notes.map((n) => [n.id, n]));
  const start = notes.find((n) => n.slug === fromSlug);
  const end = notes.find((n) => n.slug === toSlug);

  if (!start || !end) return null;
  if (start.id === end.id) {
    return { path: [start], distance: 0, method: "recursive-cte" };
  }

  type PathRow = { end_id: string; path: string[]; depth: number };

  const rows = await prisma.$queryRaw<PathRow[]>`
    WITH RECURSIVE edges AS (
      SELECT l.source_id AS a, l.target_id AS b
      FROM links l
      INNER JOIN notes source_note ON source_note.id = l.source_id
      INNER JOIN notes target_note ON target_note.id = l.target_id
      WHERE source_note.user_id = ${userId}
        AND target_note.user_id = ${userId}
      UNION
      SELECT l.target_id AS a, l.source_id AS b
      FROM links l
      INNER JOIN notes source_note ON source_note.id = l.source_id
      INNER JOIN notes target_note ON target_note.id = l.target_id
      WHERE source_note.user_id = ${userId}
        AND target_note.user_id = ${userId}
    ),
    paths AS (
      SELECT
        ${start.id}::text AS start_id,
        ${start.id}::text AS end_id,
        ARRAY[${start.id}::text] AS path,
        0 AS depth
      UNION ALL
      SELECT
        p.start_id,
        e.b::text AS end_id,
        p.path || e.b::text,
        p.depth + 1
      FROM paths p
      JOIN edges e ON e.a::text = p.end_id
      WHERE NOT e.b::text = ANY(p.path)
        AND p.depth < ${notes.length - 1}
    )
    SELECT end_id, path, depth
    FROM paths
    WHERE end_id = ${end.id}
    ORDER BY depth
    LIMIT 1
  `;

  if (rows.length === 0) return null;

  const path = rows[0].path
    .map((id) => noteById.get(id))
    .filter(Boolean) as GraphNode[];

  return {
    path,
    distance: rows[0].depth,
    method: "recursive-cte",
  };
}

export async function getOrphanNotes(userId: string) {
  const notes = await prisma.note.findMany({
    where: {
      userId,
      outgoing: { none: {} },
      incoming: { none: {} },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
    },
  });

  return notes;
}

export async function getGardenStats(userId: string) {
  const [noteCount, linkCount, orphanCount, recentNotes] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.link.count({ where: { source: { userId } } }),
    prisma.note.count({
      where: {
        userId,
        outgoing: { none: {} },
        incoming: { none: {} },
      },
    }),
    prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, updatedAt: true },
    }),
  ]);

  const avgLinks =
    noteCount > 0 ? Math.round((linkCount / noteCount) * 10) / 10 : 0;

  return {
    noteCount,
    linkCount,
    orphanCount,
    avgLinksPerNote: avgLinks,
    recentNotes,
  };
}
