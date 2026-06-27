export type DisputeCategory =
  | 'consumer'
  | 'tenancy'
  | 'employment'
  | 'property'
  | 'family'
  | 'contract'
  | 'debt_recovery'
  | 'harassment';

export type EvidenceItemType =
  | 'salary_slip'
  | 'written_contract'
  | 'official_receipt'
  | 'warranty_card'
  | 'bank_statement'
  | 'whatsapp_messages'
  | 'email_correspondence'
  | 'witness_verbal'
  | 'verbal_agreement'
  | 'photos'
  | 'video'
  | 'custom';

export interface EvidenceItem {
  id: string;
  type: EvidenceItemType;
  label: string;
  score: number;
}

export interface PrecedentCase {
  caseName: string;
  citation: string;
  court: string;
  year: number;
  outcome: 'plaintiff_won' | 'defendant_won' | 'settled' | 'unknown';
  filingFee: number | null;
  keyHolding: string;
  relevanceScore?: number;
  facts?: string;
  legalPrinciples?: string[];
}

export interface StatuteInfo {
  category: DisputeCategory;
  actName: string;
  relevantSections: string[];
  recommendedForum: string;
  limitationPeriodDays: number;
  filingFeeINR: number | string;
  avgResolutionDays: number;
}

export type LandmineType =
  | 'limitation_expired'
  | 'wrong_forum'
  | 'missing_prerequisite'
  | 'identity_gap';

export interface Landmine {
  type: LandmineType;
  description: string;
  remedy: string;
}

// ── Case Assessment (replaces fake success probability) ──────────────

export type CaseStrength = 'strong' | 'moderate' | 'challenging';

export interface CaseAssessment {
  strength: CaseStrength;
  label: string;
  strengths: string[];
  weaknesses: string[];
  criticalActions: string[];
  limitationStatus: 'within_time' | 'near_expiry' | 'expired' | 'unknown';
  limitationDetail: string | null;
}

// ── Document Verification ────────────────────────────────────────────

export type VerificationSeverity = 'error' | 'warning' | 'info';

export interface VerificationIssue {
  severity: VerificationSeverity;
  category: 'citation' | 'jurisdiction' | 'limitation' | 'identity' | 'structure';
  message: string;
  suggestion: string;
}

export interface VerificationResult {
  passed: boolean;
  issues: VerificationIssue[];
  checkedAt: string;
}

// ── Dispute Record ───────────────────────────────────────────────────

export interface DisputeRecord {
  id?: string;
  complainantName: string;
  complainantAddress: string | null;
  respondentName: string;
  respondentAddress: string | null;
  disputeCategory: DisputeCategory;
  amountInvolved: number | null;
  incidentDate: string | null;
  evidenceItems: string[];
  originalLanguage: string;
  rawInputTranslated: string;
  summary: string;
  statuteInfo?: StatuteInfo;
  precedentCases?: PrecedentCase[];
  caseAssessment?: CaseAssessment;
  landmines?: Landmine[];
  clarifyingQuestions?: string[];
  /** @deprecated Use caseAssessment instead */
  successProbability?: number;
}

export interface AdversarialCritique {
  wrongCitations: string[];
  proceduralVulnerabilities: string[];
  factualGaps: string[];
  counterNarratives: string[];
}

export interface RevisionRecord {
  round: number;
  critiqueApplied: AdversarialCritique;
  revisedAt: string;
}

export interface DocumentSet {
  legalNotice: string;
  forumComplaint: string;
  evidenceChecklist: string;
  coachingSummary: string;
  revisedNotice?: string;
  revisedComplaint?: string;
  adversarialCritique?: AdversarialCritique;
  revisionHistory?: RevisionRecord[];
  verification?: VerificationResult;
}

export type ScoreDimensionKey =
  | 'contractSafety'
  | 'tenancyProtection'
  | 'employmentSecurity'
  | 'consumerRights'
  | 'digitalRights'
  | 'familyDocumentation';

export interface ScoreDimension {
  key: ScoreDimensionKey;
  label: string;
  score: number;
  maxScore: number;
  urgentAction: string;
  detailItems: string[];
}

export interface ActionItem {
  dimension: ScoreDimensionKey;
  action: string;
  scoreDelta: number;
  estimatedMinutes: number;
  clauseText?: string;
}

export interface NyayScoreResult {
  id?: string;
  totalScore: number;
  label: 'Significantly Vulnerable' | 'Moderately Protected' | 'Well Protected';
  labelColor: 'red' | 'amber' | 'green';
  dimensions: ScoreDimension[];
  actionItems: ActionItem[];
  scannedAt: string;
  uploadedDocuments: UploadedDocument[];
}

export interface UploadedDocument {
  name: string;
  type: string;
  size: number;
  extractedText: string;
  parseSuccess: boolean;
}

export type AgentStatusValue = 'pending' | 'active' | 'complete' | 'error';

export interface AgentStatus {
  id: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  status: AgentStatusValue;
  logLine: string;
}

export interface PipelineState {
  disputeId: string | null;
  currentStep: 'idle' | 'intake' | 'analyse' | 'generate' | 'review' | 'complete';
  agents: AgentStatus[];
  disputeRecord: DisputeRecord | null;
  documents: Partial<DocumentSet>;
  streamingContent: string;
  adversarialPhase: 'idle' | 'critiquing' | 'rewriting' | 'finalized';
  error: string | null;
}

export interface IntakeFormData {
  input: string;
  evidenceItems: string[];
  amountInvolved: number | null;
  incidentDate: string | null;
}

export interface DisputeRow {
  id: string;
  status: string;
  originalInput: string;
  originalLanguage: string;
  disputeRecord: string;
  legalNotice: string | null;
  forumComplaint: string | null;
  evidenceChecklist: string | null;
  coachingSummary: string | null;
  revisedNotice: string | null;
  revisedComplaint: string | null;
  adversarialCritique: string | null;
  revisionCount: number;
  successProbability: number | null;
  createdAt: Date;
  updatedAt: Date;
}
