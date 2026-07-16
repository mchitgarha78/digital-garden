import { requireSession } from "@/lib/auth";
import { getFullGraph } from "@/lib/graph";
import { GardenGraph } from "@/components/graph/GardenGraph";

export default async function GardenPage() {
  const session = await requireSession();
  const graph = await getFullGraph(session.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">نمای باغ</h1>
        <p className="mt-1 text-slate-500">
          شبکه دانش شما — گره‌ها را بکشید، زوم کنید و برای باز کردن یادداشت کلیک کنید
        </p>
      </div>
      {graph.nodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          ابتدا چند یادداشت با لینک متقابل ایجاد کنید
        </div>
      ) : (
        <GardenGraph initialNodes={graph.nodes} initialEdges={graph.edges} />
      )}
    </div>
  );
}
