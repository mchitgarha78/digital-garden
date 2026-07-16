import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { notFound, unauthorized } from "@/lib/api";
import { getLocalGraph } from "@/lib/graph";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { slug } = await context.params;
  const graph = await getLocalGraph(user.id, slug);

  if (!graph) return notFound("یادداشت یافت نشد");

  return NextResponse.json(graph);
}
