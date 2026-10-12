'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import LeadForm from '../../../components/LeadForm';
import ScoreBadge from '../../../components/ScoreBadge';
import { api, json } from '../../../lib/api';
import { InteractionType, Lead, LeadStatus, STATUS_LABELS, TYPE_LABELS } from '../../../lib/types';

const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm';
const card = 'rounded-lg border border-slate-200 bg-white p-5';
const fmt = (d: string) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const List = ({ title, items }: { title: string; items?: string[] }) =>
  items && items.length ? (
    <div className="mt-3">
      <h4 className="text-sm font-medium text-slate-700">{title}</h4>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-600">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  ) : null;

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiError, setAiError] = useState('');
  const [itx, setItx] = useState({ type: 'EMAIL' as InteractionType, date: nowLocal(), description: '' });

  const load = useCallback(async () => {
    try { setLead(await api<Lead>(`leads/${id}`)); } catch (e: any) { setError(e.message); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function runAi(action: 'analyze' | 'summarize' | 'score' | 'recommend' | 'refresh') {
    setAiBusy(action); setAiError('');
    try { setLead(await api<Lead>(`ai/leads/${id}/${action}`, json('POST'))); }
    catch (e: any) { setAiError(e.message); }
    finally { setAiBusy(null); }
  }

  async function changeStatus(status: LeadStatus) {
    await api(`leads/${id}`, json('PATCH', { status }));
    load();
  }

  async function addInteraction(e: React.FormEvent) {
    e.preventDefault();
    await api(`leads/${id}/interactions`, json('POST', { ...itx, date: new Date(itx.date).toISOString() }));
    setItx({ ...itx, description: '', date: nowLocal() });
    load();
  }

  async function removeInteraction(iid: string) {
    if (!confirm('Supprimer cette interaction ?')) return;
    await api(`interactions/${iid}`, json('DELETE'));
    load();
  }

  async function removeLead() {
    if (!lead || !confirm(`Supprimer ${lead.contactName} ?`)) return;
    await api(`leads/${id}`, json('DELETE'));
    router.push('/leads');
  }

  if (error) return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error} <Link href="/leads" className="underline">Retour aux prospects</Link></p>;
  if (!lead) return <p className="text-slate-400">Chargement…</p>;

  const btn = (action: Parameters<typeof runAi>[0], label: string) => (
    <button onClick={() => runAi(action)} disabled={!!aiBusy} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50">
      {aiBusy === action ? 'Analyse en cours…' : label}
    </button>
  );

  return (
    <div className="space-y-6">
      <Link href="/leads" className="text-sm text-slate-500 hover:text-slate-900">← Prospects</Link>

      {/* Header */}
      <div className={`${card} flex flex-wrap items-start gap-4`}>
        <div className="mr-auto">
          <h1 className="text-xl font-semibold">{lead.contactName}</h1>
          <p className="text-slate-600">{lead.companyName}</p>
          <p className="mt-2 text-sm text-slate-500">
            {lead.email}{lead.phone && ` · ${lead.phone}`}{lead.sector && ` · ${lead.sector}`}{lead.source && ` · Source : ${lead.source}`}
            {lead.estimatedBudget != null && ` · Budget : ${lead.estimatedBudget.toLocaleString('fr-FR')}`}
          </p>
        </div>
        <ScoreBadge score={lead.score} />
        <select value={lead.status} onChange={(e) => changeStatus(e.target.value as LeadStatus)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={() => setEditing(true)} className="text-sm text-slate-600 hover:text-slate-900">Modifier</button>
        <button onClick={removeLead} className="text-sm text-red-600 hover:text-red-800">Supprimer</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Interactions */}
        <section className={card}>
          <h2 className="mb-3 font-semibold">Interactions</h2>
          <form onSubmit={addInteraction} className="mb-4 space-y-2">
            <div className="flex gap-2">
              <select value={itx.type} onChange={(e) => setItx({ ...itx, type: e.target.value as InteractionType })} className={input}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input type="datetime-local" value={itx.date} onChange={(e) => setItx({ ...itx, date: e.target.value })} className={input} />
            </div>
            <textarea required rows={3} value={itx.description} onChange={(e) => setItx({ ...itx, description: e.target.value })} placeholder="Ce qui s'est dit, décidé ou promis…" className={input} />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">Ajouter l'interaction</button>
          </form>
          {lead.interactions?.length ? (
            <ul className="divide-y divide-slate-100">
              {lead.interactions.map((i) => (
                <li key={i.id} className="py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">{TYPE_LABELS[i.type]}</span>
                    {fmt(i.date)}
                    <button onClick={() => removeInteraction(i.id)} className="ml-auto text-red-500 hover:text-red-700">Supprimer</button>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{i.description}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">Aucune interaction. Notez votre premier échange ci-dessus.</p>}
        </section>

        {/* AI */}
        <section className={card}>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="mr-auto font-semibold">Assistant IA</h2>
            <button onClick={() => runAi('refresh')} disabled={!!aiBusy} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">
              {aiBusy === 'refresh' ? 'Analyse en cours…' : 'Tout actualiser'}
            </button>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {btn('analyze', 'Analyser le prospect')}{btn('summarize', 'Résumer les échanges')}{btn('score', 'Calculer le score')}{btn('recommend', 'Prochaines actions')}
          </div>
          {aiError && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{aiError}</p>}
          {lead.aiUpdatedAt && <p className="mb-3 text-xs text-slate-400">Dernière mise à jour : {fmt(lead.aiUpdatedAt)}</p>}

          {!lead.aiAnalysis && !lead.aiSummary && !lead.aiScoreDetails && !lead.aiActions && (
            <p className="text-sm text-slate-500">Lancez une analyse pour obtenir un profil, un résumé, un score et des actions recommandées.</p>
          )}

          {lead.aiScoreDetails && (
            <div className="mb-5">
              <h3 className="font-medium">Score : {lead.aiScoreDetails.score}/100 <span className="text-sm font-normal text-slate-500">({lead.aiScoreDetails.level})</span></h3>
              <List title="Pourquoi" items={lead.aiScoreDetails.reasons} />
            </div>
          )}
          {lead.aiActions && (
            <div className="mb-5">
              <h3 className="font-medium">Actions recommandées</h3>
              <ol className="mt-2 space-y-2">
                {lead.aiActions.actions.map((a, i) => (
                  <li key={i} className="rounded-md bg-slate-50 p-3 text-sm">
                    <div className="font-medium">{a.title} <span className="font-normal text-slate-500">· {a.priority} · {a.timing}</span></div>
                    <div className="text-slate-600">{a.rationale}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {lead.aiAnalysis && (
            <div className="mb-5">
              <h3 className="font-medium">Analyse du profil</h3>
              <p className="mt-1 text-sm text-slate-600">{lead.aiAnalysis.profile}</p>
              <List title="Caractéristiques clés" items={lead.aiAnalysis.keyCharacteristics} />
              <List title="Points forts" items={lead.aiAnalysis.strengths} />
              <List title="Risques" items={lead.aiAnalysis.risks} />
              <List title="Informations à collecter" items={lead.aiAnalysis.missingInfo} />
            </div>
          )}
          {lead.aiSummary && (
            <div>
              <h3 className="font-medium">Résumé des interactions</h3>
              <p className="mt-1 text-sm text-slate-600">{lead.aiSummary.summary}</p>
              <List title="Points importants" items={lead.aiSummary.keyPoints} />
              <List title="Engagements" items={lead.aiSummary.commitments} />
              <List title="Points ouverts" items={lead.aiSummary.openQuestions} />
            </div>
          )}
        </section>
      </div>

      {editing && <LeadForm initial={lead} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />}
    </div>
  );
}
