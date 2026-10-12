export default function ScoreBadge({ score }: { score?: number | null }) {
  if (score == null) return <span className="text-xs text-slate-400">Non évalué</span>;
  const tone = score >= 65 ? 'bg-emerald-100 text-emerald-800' : score >= 35 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700';
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{score}/100</span>;
}
