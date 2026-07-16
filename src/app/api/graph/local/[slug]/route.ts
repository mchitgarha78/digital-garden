import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { notFound, unauthorized } from "@/lib/api";
import { getLocalGraph } from "@/lib/graph";
import { decodeSlug } from "@/lib/links";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { slug: rawSlug } = await context.params;
  const slug = decodeSlug(rawSlug);
  const graph = await getLocalGraph(user.id, slug);

  if (!graph) return notFound("یادداشت یافت نشد");

  return NextResponse.json(graph);
}
