import { DisputeRecord, VerificationResult, VerificationIssue } from '@/types';
import statutes from '@/data/statutes.json';

/**
 * Deterministic document verification.
 *
 * This is NOT an LLM call. It's code that checks generated documents
 * against our known-good statute data. Every check is traceable and
 * reproducible.
 */

type StatuteMap = Record<string, {
  actName: string;
  relevantSections: string[];
  recommendedForum: string;
  limitationPeriodDays: number;
  filingFeeINR: number | string;
}>;

const STATUTE_DATA = statutes as unknown as StatuteMap;

// Extract "Section XX" patterns from text
function extractCitations(text: string): string[] {
  const pattern = /Section\s+(\d+[A-Za-z]*(?:\([^)]*\))?)/gi;
  const matches: string[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    matches.push(`Section ${match[1]}`);
  }
  return [...new Set(matches)];
}

// Check if a citation exists in our statute data for this category
function isCitationValid(citation: string, category: string): boolean {
  const statute = STATUTE_DATA[category];
  if (!statute) return false;
  // Normalize for comparison
  const normalized = citation.toLowerCase().trim();
  return statute.relevantSections.some(
    s => s.toLowerCase().trim() === normalized
  );
}

// Check for mandatory structural elements in a legal notice
function checkNoticeStructure(notice: string): VerificationIssue[] {
  const issues: VerificationIssue[] = [];
  const lower = notice.toLowerCase();

  const mandatoryElements = [
    { pattern: /legal notice/i, name: 'Legal Notice heading' },
    { pattern: /sir|madam|to\s*:/i, name: 'Addressee' },
    { pattern: /\d{1,2}[\s/-]\w+[\s/-]\d{4}|date/i, name: 'Date' },
    { pattern: /demand|relief|compensation|pay/i, name: 'Demand/Relief clause' },
    { pattern: /\d+\s*days?|within/i, name: 'Compliance deadline' },
  ];

  for (const el of mandatoryElements) {
    if (!el.pattern.test(notice)) {
      issues.push({
        severity: 'warning',
        category: 'structure',
        message: `Legal notice may be missing: ${el.name}`,
        suggestion: `Ensure the notice includes a clear ${el.name.toLowerCase()} section. Indian courts expect formal structure.`,
      });
    }
  }

  // Check for placeholder text that LLMs sometimes leave
  const placeholderPatterns = [
    /\[.*?\]/g,
    /\{.*?\}/g,
    /INSERT|PLACEHOLDER|TODO|TBD/i,
    /your name here/i,
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(notice)) {
      issues.push({
        severity: 'error',
        category: 'structure',
        message: 'Document contains placeholder text that was not filled in.',
        suggestion: 'All placeholder text must be replaced with actual case details before the document can be used.',
      });
      break;
    }
  }

  return issues;
}

export function verifyDocuments(
  record: DisputeRecord,
  legalNotice: string,
  forumComplaint: string
): VerificationResult {
  const issues: VerificationIssue[] = [];

  // ── 1. Citation verification ───────────────────────────────────────
  const noticeCitations = extractCitations(legalNotice);
  const complaintCitations = extractCitations(forumComplaint);
  const allCitations = [...new Set([...noticeCitations, ...complaintCitations])];

  const validCitations: string[] = [];
  const unknownCitations: string[] = [];

  for (const citation of allCitations) {
    if (isCitationValid(citation, record.disputeCategory)) {
      validCitations.push(citation);
    } else {
      unknownCitations.push(citation);
    }
  }

  if (unknownCitations.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'citation',
      message: `Citations not in our verified statute database: ${unknownCitations.join(', ')}. These may be valid but could not be automatically verified.`,
      suggestion: 'Cross-check these citations against the actual Act text before filing. An incorrect citation can weaken your case.',
    });
  }

  if (allCitations.length === 0) {
    issues.push({
      severity: 'error',
      category: 'citation',
      message: 'No statutory citations found in the generated documents.',
      suggestion: 'Legal documents must cite specific sections of the applicable Act. This is a critical deficiency.',
    });
  }

  // ── 2. Jurisdiction check ──────────────────────────────────────────
  if (record.statuteInfo) {
    const forumMentioned = forumComplaint.toLowerCase().includes(
      record.statuteInfo.recommendedForum.toLowerCase().split('/')[0].trim().toLowerCase()
    );
    if (!forumMentioned) {
      issues.push({
        severity: 'warning',
        category: 'jurisdiction',
        message: `The recommended forum "${record.statuteInfo.recommendedForum}" may not be clearly stated in the complaint.`,
        suggestion: 'The complaint should explicitly state which forum/court has jurisdiction and why.',
      });
    }

    // Consumer amount jurisdiction check
    if (record.disputeCategory === 'consumer' && record.amountInvolved) {
      if (record.amountInvolved > 5000000 && /district/i.test(forumComplaint)) {
        issues.push({
          severity: 'error',
          category: 'jurisdiction',
          message: `Claim amount Rs.${record.amountInvolved.toLocaleString('en-IN')} exceeds District Commission limit (Rs.50 lakh) but complaint appears to reference District Commission.`,
          suggestion: 'File at State Consumer Disputes Redressal Commission (Rs.50L-2Cr) or National Commission (above Rs.2Cr).',
        });
      }
    }
  }

  // ── 3. Respondent identification ───────────────────────────────────
  if (record.respondentName) {
    const nameInNotice = legalNotice.includes(record.respondentName);
    const nameInComplaint = forumComplaint.includes(record.respondentName);
    if (!nameInNotice || !nameInComplaint) {
      issues.push({
        severity: 'warning',
        category: 'identity',
        message: 'Respondent name may not appear consistently across both documents.',
        suggestion: 'Ensure the exact respondent name appears in both the legal notice and the forum complaint for consistency.',
      });
    }
  }

  // ── 4. Structural checks ───────────────────────────────────────────
  issues.push(...checkNoticeStructure(legalNotice));

  // ── 5. Cross-document consistency ──────────────────────────────────
  if (record.amountInvolved) {
    const amountStr = record.amountInvolved.toString();
    const amountFormatted = record.amountInvolved.toLocaleString('en-IN');
    const inNotice = legalNotice.includes(amountStr) || legalNotice.includes(amountFormatted);
    const inComplaint = forumComplaint.includes(amountStr) || forumComplaint.includes(amountFormatted);
    if (inNotice !== inComplaint) {
      issues.push({
        severity: 'warning',
        category: 'structure',
        message: 'Claim amount may not be consistently stated across both documents.',
        suggestion: 'The exact claim amount should appear in both the legal notice and the forum complaint.',
      });
    }
  }

  const hasErrors = issues.some(i => i.severity === 'error');

  return {
    passed: !hasErrors,
    issues,
    checkedAt: new Date().toISOString(),
  };
}
