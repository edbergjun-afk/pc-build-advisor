import { formatPHP } from "@/lib/format";
import type { BuildEvaluation, Category } from "@/lib/types";

const CATEGORY_LABELS: Record<Category, string> = {
  cpu: "CPU",
  motherboard: "Motherboard",
  ram: "Memory",
  gpu: "Graphics",
  storage: "Storage",
  psu: "Power supply",
  case: "Case",
  cooler: "CPU cooler",
};

export default function BuildPanel({ build }: { build: BuildEvaluation | null }) {
  if (!build) {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        <h2 className="mb-1 font-medium text-slate-700">Your build</h2>
        Your checked parts list appears here once the advisor suggests a build.
      </aside>
    );
  }

  const errors = build.issues.filter((i) => i.severity === "error");
  const warnings = build.issues.filter((i) => i.severity === "warning");
  const spentPct = Math.min(100, Math.round((build.total / build.budget) * 100));
  const ok = build.compatible && build.withinBudget;

  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">Your build</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {ok ? "Compatible, within budget" : "Needs changes"}
        </span>
      </div>

      <table className="w-full text-sm">
        <tbody>
          {build.parts.map((p) => (
            <tr key={p.id} className="border-b border-slate-100 align-top last:border-0">
              <td className="py-1.5 pr-2 text-xs text-slate-500">{CATEGORY_LABELS[p.category]}</td>
              <td className="py-1.5 pr-2">{p.name}</td>
              <td className="whitespace-nowrap py-1.5 text-right tabular-nums">{formatPHP(p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPHP(build.total)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Budget</span>
          <span className="tabular-nums">{formatPHP(build.budget)}</span>
        </div>
        <div className={`flex justify-between ${build.withinBudget ? "text-emerald-700" : "text-red-700"}`}>
          <span>{build.withinBudget ? "Left over" : "Over budget by"}</span>
          <span className="tabular-nums">{formatPHP(Math.abs(build.remaining))}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <div
            className={`h-full ${build.withinBudget ? "bg-indigo-500" : "bg-red-500"}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-600">
        Estimated peak power {build.estimatedLoadW} W · recommended PSU {build.recommendedPsuW} W or more
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {errors.map((i) => (
            <li key={i.code + i.message} className="text-red-700">
              ✗ {i.message}
            </li>
          ))}
          {warnings.map((i) => (
            <li key={i.code + i.message} className="text-amber-700">
              ! {i.message}
            </li>
          ))}
        </ul>
      )}
      {errors.length === 0 && (
        <p className="mt-3 text-sm text-emerald-700">✓ Socket, memory, size, cooler and power checks passed.</p>
      )}
    </aside>
  );
}
