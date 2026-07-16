import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { unauthorized } from "@/lib/api";
import { getGardenStats, getOrphanNotes } from "@/lib/graph";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const [stats, orphans] = await Promise.all([
    getGardenStats(user.id),
    getOrphanNotes(user.id),
  ]);

  return NextResponse.json({ stats, orphans });
}
