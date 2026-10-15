export type PathNode = { id: string; slug: string };
export type PathEdge = { sourceId: string; targetId: string };
export type ShortestPath<T> = { path: T[]; distance: number } | null;

/** Finds a shortest path in an undirected graph using BFS. */
export function findShortestPath<T extends PathNode>(
  nodes: T[], edges: PathEdge[], fromSlug: string, toSlug: string,
): ShortestPath<T> {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const nodeBySlug = new Map(nodes.map((node) => [node.slug, node]));
  const start = nodeBySlug.get(fromSlug);
  const end = nodeBySlug.get(toSlug);
  if (!start || !end) return null;
  if (start.id === end.id) return { path: [start], distance: 0 };
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!nodeById.has(edge.sourceId) || !nodeById.has(edge.targetId)) continue;
    if (!adjacency.has(edge.sourceId)) adjacency.set(edge.sourceId, []);
    if (!adjacency.has(edge.targetId)) adjacency.set(edge.targetId, []);
    adjacency.get(edge.sourceId)!.push(edge.targetId);
    adjacency.get(edge.targetId)!.push(edge.sourceId);
  }
  const queue = [start.id];
  let queueIndex = 0;
  const visited = new Set([start.id]);
  const parent = new Map<string, string>();
  while (queueIndex < queue.length) {
    const current = queue[queueIndex++];
    if (current === end.id) break;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      parent.set(neighbor, current);
      queue.push(neighbor);
    }
  }
  if (!visited.has(end.id)) return null;
  const pathIds: string[] = [];
  let cursor: string | undefined = end.id;
  while (cursor !== undefined) {
    pathIds.push(cursor);
    cursor = parent.get(cursor);
  }
  pathIds.reverse();
  const path = pathIds.map((id) => nodeById.get(id)!);
  return { path, distance: path.length - 1 };
}
