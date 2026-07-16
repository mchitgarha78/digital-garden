import { getGardenStats, getOrphanNotes } from "@/lib/graph";
import { requireSession } from "@/lib/auth";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const session = await requireSession();
  const [stats, orphans] = await Promise.all([
    getGardenStats(session.id),
    getOrphanNotes(session.id),
  ]);

  return <DashboardView stats={stats} orphans={orphans} />;
}
