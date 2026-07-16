import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { unauthorized } from "@/lib/api";
import { getFullGraph, getLocalGraph, findPathBFS, findPathRecursiveCTE } from "@/lib/graph";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const method = searchParams.get("method") ?? "bfs";

  if (from && to) {
    const result =
      method === "cte"
        ? await findPathRecursiveCTE(user.id, from, to)
        : await findPathBFS(user.id, from, to);

    return NextResponse.json({ path: result });
  }

  const graph = await getFullGraph(user.id);
  return NextResponse.json(graph);
}
