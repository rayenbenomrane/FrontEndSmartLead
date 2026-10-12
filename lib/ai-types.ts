export type Level = 'HOT' | 'WARM' | 'COLD';

export interface ScoreDetails {
  source: 'llm' | 'rules';
  score: number;
  level: Level;
  baseScore: number;
  adjustment: number;
  breakdown: Record<string, number>;
  reasons: string[];
}
export interface Analysis {
  source: 'llm' | 'rules';
  profileSummary: string;
  keyCharacteristics: string[];
  strengths: string[];
  risks: string[];
  missingInfo: string[];
}
export interface Summary {
  source: 'llm' | 'rules';
  summary: string;
  keyPoints: string[];
  commitments: string[];
  objections: string[];
  nextStepMentioned: string | null;
}
export interface Recommendations {
  source: 'llm' | 'rules';
  actions: { priority: 'HIGH' | 'MEDIUM' | 'LOW'; action: string; rationale: string; timing: string }[];
  emailDraft: { subject: string; body: string } | null;
}
export interface StoredAi {
  id: string;
  score: number | null;
  aiScoreDetails: ScoreDetails | null;
  aiAnalysis: Analysis | null;
  aiSummary: Summary | null;
  aiActions: Recommendations | null;
  aiUpdatedAt: string | null;
}
export interface DashboardStats {
  total: number;
  byStatus: { status: string; count: number; totalValue: number }[];
  pipelineValue: number;
  wonValue: number;
  conversionRate: number | null;
  averageScore: number | null;
  hotProspects: number;
  followUpsDue: number;
}
export interface PriorityItem {
  id: string; firstName: string; lastName: string; company: string;
  status: string; estimatedValue: number | null; score: number; level: Level;
}
export interface UserRow {
  id: string; name: string; email: string; role: 'ADMIN' | 'COMMERCIAL'; status: 'ACTIVE' | 'INACTIVE';
}

export const STATUS_LABEL: Record<string, string> = {
  NEW: 'Nouveau', CONTACTED: 'Contacté', QUALIFIED: 'Qualifié', NEGOTIATION: 'En négociation',
  PROPOSAL_SENT: 'Proposition envoyée', WON: 'Gagné', LOST: 'Perdu',
};
