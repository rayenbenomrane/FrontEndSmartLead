import type { Level } from '@/lib/ai-types';

const STYLE: Record<Level, string> = {
  HOT: 'bg-red-100 text-red-700 ring-red-200',
  WARM: 'bg-amber-100 text-amber-700 ring-amber-200',
  COLD: 'bg-sky-100 text-sky-700 ring-sky-200',
};
const LABEL: Record<Level, string> = { HOT: 'Chaud', WARM: 'Tiède', COLD: 'Froid' };

export const levelOf = (s: number): Level => (s >= 70 ? 'HOT' : s >= 40 ? 'WARM' : 'COLD');

/** À utiliser aussi dans la liste des prospects : <ScoreBadge score={p.score} /> */
export default function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Non évalué</span>;
  }
  const level = levelOf(score);
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STYLE[level]}`}>
      {score}/100 · {LABEL[level]}
    </span>
  );
}
