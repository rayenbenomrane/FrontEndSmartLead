export type BusinessRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ProspectStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'PROPOSAL_SENT' | 'WON' | 'LOST';
export type InteractionType = 'EMAIL' | 'REUNION' | 'NOTE';

export const STATUS_CONFIG: Record<ProspectStatus, { label: string; badge: string; dot: string }> = {
  NEW: { label: 'Nouveau', badge: 'bg-slate-100 text-slate-700 ring-slate-500/10', dot: 'bg-slate-400' },
  CONTACTED: { label: 'Contacté', badge: 'bg-sky-50 text-sky-700 ring-sky-600/10', dot: 'bg-sky-500' },
  QUALIFIED: { label: 'Qualifié', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/10', dot: 'bg-indigo-500' },
  NEGOTIATION: { label: 'En négociation', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  PROPOSAL_SENT: { label: 'Proposition envoyée', badge: 'bg-violet-50 text-violet-700 ring-violet-600/10', dot: 'bg-violet-500' },
  WON: { label: 'Gagné', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  LOST: { label: 'Perdu', badge: 'bg-red-50 text-red-700 ring-red-600/10', dot: 'bg-red-500' },
};
export const STATUSES = Object.keys(STATUS_CONFIG) as ProspectStatus[];

export const INTERACTION_CONFIG: Record<InteractionType, { label: string; icon: string; badge: string }> = {
  EMAIL: { label: 'Email', icon: '✉', badge: 'bg-sky-50 text-sky-700' },
  REUNION: { label: 'Reunion', icon: '📅', badge: 'bg-violet-50 text-violet-700' },
  NOTE: { label: 'Note', icon: '📝', badge: 'bg-amber-50 text-amber-700' },
};

export const ROLE_CONFIG: Record<BusinessRole, { label: string; className: string }> = {
  OWNER: { label: 'Propriétaire', className: 'bg-violet-50 text-violet-700 ring-violet-600/10' },
  ADMIN: { label: 'Administrateur', className: 'bg-blue-50 text-blue-700 ring-blue-600/10' },
  MEMBER: { label: 'Membre', className: 'bg-slate-100 text-slate-600 ring-slate-500/10' },
};

export type Prospect = {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  industry: string | null;
  region: string | null;
  website: string | null;
  source: string;
  estimatedValue: number | null;
  score: number | null;
  status: ProspectStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
export type Interaction = {
  id: string;
  prospectId: string;
  type: InteractionType;
  date: string;
  description: string;
  createdAt: string;
};

export type Business = {
  id: string;
  name: string;
  matriculeFiscale: string;
  description: string | null;
  region: string;
  serviceDomain: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  createdAt: string;
  role: BusinessRole;
};

export type Member = { id: string; userId: string; name: string; email: string; role: BusinessRole; createdAt: string };
export type User = { id: string; name: string; email: string; role: 'ADMIN' | 'COMMERCIAL'; status: string };

export const formatMoney = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
