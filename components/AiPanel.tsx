'use client';

import { useCallback, useEffect, useState } from 'react';
import { aiApi } from '@/lib/api';
import type { Analysis, Recommendations, ScoreDetails, StoredAi, Summary } from '@/lib/ai-types';
import ScoreBadge from './ScoreBadge';

type Tab = 'score' | 'analysis' | 'summary' | 'actions';
const TABS: { id: Tab; label: string }[] = [
  { id: 'score', label: 'Score' },
  { id: 'analysis', label: 'Analyse' },
  { id: 'summary', label: 'Résumé' },
  { id: 'actions', label: 'Actions' },
];
const BREAKDOWN_LABEL: Record<string, string> = {
  budget: 'Budget', status: 'Avancement', engagement: 'Engagement', recency: 'Récence', completeness: 'Complétude',
};
const BREAKDOWN_MAX: Record<string, number> = { budget: 25, status: 25, engagement: 28, recency: 15, completeness: 10 };
const PRIORITY_STYLE = { HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-amber-100 text-amber-700', LOW: 'bg-gray-100 text-gray-600' };
const btn = 'rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50';

function List({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-1 text-sm font-medium text-gray-700">{title}</h4>
      <ul className="list-disc space-y-0.5 pl-5 text-sm text-gray-600">{items.map((i, k) => <li key={k}>{i}</li>)}</ul>
    </div>
  );
}

function Meta({ source, onRefresh, busy }: { source?: string; onRefresh: () => void; busy: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{source === 'llm' ? 'Généré par IA' : 'Calculé par règles (IA indisponible)'}</span>
      <button onClick={onRefresh} disabled={busy} className="text-xs text-indigo-600 hover:underline disabled:opacity-50">
        {busy ? 'Actualisation…' : 'Actualiser'}
      </button>
    </div>
  );
}

function Empty({ text, onRun, busy }: { text: string; onRun: () => void; busy: boolean }) {
  return (
    <div className="py-6 text-center text-sm text-gray-500">
      <p className="mb-3">{text}</p>
      <button onClick={onRun} disabled={busy} className={btn}>{busy ? 'Génération…' : 'Générer'}</button>
    </div>
  );
}

/** Panneau IA à placer sur la page détail d'un prospect : <AiPanel prospectId={id} /> */
export default function AiPanel({ prospectId, onScore }: { prospectId: string; onScore?: (s: number) => void }) {
  const [tab, setTab] = useState<Tab>('score');
  const [data, setData] = useState<StoredAi | null>(null);
  const [busy, setBusy] = useState<Tab | 'all' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try { setData(await aiApi.stored(prospectId)); } catch (e) { setError((e as Error).message); }
  }, [prospectId]);
  useEffect(() => { load(); }, [load]);

  const merge = (p: Partial<StoredAi>) => setData((d) => ({ ...(d ?? ({ id: prospectId } as StoredAi)), ...p }));

  async function run(kind: Tab | 'all') {
    setBusy(kind); setError(null);
    try {
      if (kind === 'all') {
        const r = await aiApi.runAll(prospectId);
        merge({ score: r.score.score, aiScoreDetails: r.score, aiAnalysis: r.analysis, aiSummary: r.summary, aiActions: r.recommendations });
        onScore?.(r.score.score);
      } else if (kind === 'score') {
        const r = await aiApi.score(prospectId); merge({ score: r.score, aiScoreDetails: r }); onScore?.(r.score);
      } else if (kind === 'analysis') merge({ aiAnalysis: await aiApi.analyze(prospectId) });
      else if (kind === 'summary') merge({ aiSummary: await aiApi.summarize(prospectId) });
      else merge({ aiActions: await aiApi.recommend(prospectId) });
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  }

  const score: ScoreDetails | null = data?.aiScoreDetails ?? null;
  const analysis: Analysis | null = data?.aiAnalysis ?? null;
  const summary: Summary | null = data?.aiSummary ?? null;
  const actions: Recommendations | null = data?.aiActions ?? null;
  const is = (k: Tab) => busy === k;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Assistant IA</h3>
          <ScoreBadge score={data?.score} />
        </div>
        <button onClick={() => run('all')} disabled={!!busy} className={btn}>
          {busy === 'all' ? 'Analyse en cours…' : 'Tout analyser'}
        </button>
      </header>

      <nav className="mb-4 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === t.id ? 'border-indigo-600 font-medium text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </nav>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {tab === 'score' && (score ? (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold">{score.score}<span className="text-lg text-gray-400">/100</span></div>
              <p className="text-xs text-gray-500">Base {score.baseScore}{score.adjustment ? ` · ajustement IA ${score.adjustment > 0 ? '+' : ''}${score.adjustment}` : ''}</p>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(score.breakdown).filter(([k]) => BREAKDOWN_MAX[k]).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs text-gray-600"><span>{BREAKDOWN_LABEL[k]}</span><span>{v}/{BREAKDOWN_MAX[k]}</span></div>
                <div className="h-1.5 rounded bg-gray-100"><div className="h-1.5 rounded bg-indigo-500" style={{ width: `${(v / BREAKDOWN_MAX[k]) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <List title="Raisons de l'ajustement" items={score.reasons} />
          <Meta source={score.source} onRefresh={() => run('score')} busy={is('score')} />
        </div>
      ) : <Empty text="Évaluez le potentiel de ce prospect." onRun={() => run('score')} busy={is('score')} />)}

      {tab === 'analysis' && (analysis ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{analysis.profileSummary}</p>
          <List title="Caractéristiques clés" items={analysis.keyCharacteristics} />
          <List title="Points forts" items={analysis.strengths} />
          <List title="Risques" items={analysis.risks} />
          <List title="Informations manquantes" items={analysis.missingInfo} />
          <Meta source={analysis.source} onRefresh={() => run('analysis')} busy={is('analysis')} />
        </div>
      ) : <Empty text="Obtenez une synthèse du profil du prospect." onRun={() => run('analysis')} busy={is('analysis')} />)}

      {tab === 'summary' && (summary ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{summary.summary}</p>
          <List title="Points clés" items={summary.keyPoints} />
          <List title="Engagements" items={summary.commitments} />
          <List title="Objections" items={summary.objections} />
          {summary.nextStepMentioned && <p className="text-sm"><span className="font-medium">Prochaine étape évoquée :</span> {summary.nextStepMentioned}</p>}
          <Meta source={summary.source} onRefresh={() => run('summary')} busy={is('summary')} />
        </div>
      ) : <Empty text="Résumez l'historique des interactions." onRun={() => run('summary')} busy={is('summary')} />)}

      {tab === 'actions' && (actions ? (
        <div className="space-y-3">
          {actions.actions.map((a, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_STYLE[a.priority]}`}>{a.priority}</span>
                <span className="text-sm font-medium">{a.action}</span>
                <span className="ml-auto text-xs text-gray-400">{a.timing}</span>
              </div>
              <p className="text-sm text-gray-600">{a.rationale}</p>
            </div>
          ))}
          {actions.emailDraft && (
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <h4 className="text-sm font-medium">Brouillon d'email</h4>
                <button className="text-xs text-indigo-600 hover:underline" onClick={async () => {
                  await navigator.clipboard.writeText(`Objet : ${actions.emailDraft!.subject}\n\n${actions.emailDraft!.body}`);
                  setCopied(true); setTimeout(() => setCopied(false), 1500);
                }}>{copied ? 'Copié ✓' : 'Copier'}</button>
              </div>
              <p className="text-sm font-medium">{actions.emailDraft.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{actions.emailDraft.body}</p>
            </div>
          )}
          <Meta source={actions.source} onRefresh={() => run('actions')} busy={is('actions')} />
        </div>
      ) : <Empty text="Obtenez les prochaines actions à mener." onRun={() => run('actions')} busy={is('actions')} />)}
    </section>
  );
}
