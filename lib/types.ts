export type LeadStatus = 'NOUVEAU' | 'CONTACTE' | 'EN_NEGOCIATION' | 'PROPOSITION_ENVOYEE' | 'GAGNE' | 'PERDU';
export type InteractionType = 'EMAIL' | 'REUNION' | 'NOTE';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOUVEAU: 'Nouveau',
  CONTACTE: 'Contacté',
  EN_NEGOCIATION: 'En négociation',
  PROPOSITION_ENVOYEE: 'Proposition envoyée',
  GAGNE: 'Gagné',
  PERDU: 'Perdu',
};
export const TYPE_LABELS: Record<InteractionType, string> = { EMAIL: 'Email', REUNION: 'Réunion', NOTE: 'Note' };

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  description: string;
  leadId: string;
}

export interface Lead {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
  phone?: string | null;
  sector?: string | null;
  source?: string | null;
  estimatedBudget?: number | null;
  status: LeadStatus;
  score?: number | null;
  aiScoreDetails?: { score: number; level: string; reasons: string[] } | null;
  aiAnalysis?: { profile: string; keyCharacteristics: string[]; strengths: string[]; risks: string[]; missingInfo?: string[] } | null;
  aiSummary?: { summary: string; keyPoints: string[]; commitments?: string[]; openQuestions: string[]; sentiment?: string } | null;
  aiActions?: { actions: { title: string; rationale: string; priority: string; timing: string }[] } | null;
  aiUpdatedAt?: string | null;
  interactions?: Interaction[];
}
