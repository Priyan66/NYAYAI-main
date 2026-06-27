import { groqComplete } from '@/lib/groq';
import {
  AGENT3_NOTICE_SYSTEM_PROMPT,
  AGENT3_COMPLAINT_SYSTEM_PROMPT,
  AGENT3_CHECKLIST_SYSTEM_PROMPT,
  AGENT3_COACHING_SYSTEM_PROMPT,
  AGENT3_REVISION_SYSTEM_PROMPT,
} from '@/lib/prompts';
import { DisputeRecord, DocumentSet, AdversarialCritique } from '@/types';

function buildContext(record: DisputeRecord): string {
  return `
DISPUTE RECORD:
Complainant: ${record.complainantName}, ${record.complainantAddress ?? 'Address not provided'}
Respondent: ${record.respondentName}, ${record.respondentAddress ?? 'Address not provided'}
Category: ${record.disputeCategory}
Amount: ${record.amountInvolved ? `Rs.${record.amountInvolved}` : 'Not specified'}
Incident Date: ${record.incidentDate ?? 'Not specified'}
Summary: ${record.summary}
Evidence: ${record.evidenceItems.join(', ')}
Original Language: ${record.originalLanguage}

APPLICABLE STATUTE:
Act: ${record.statuteInfo?.actName}
Relevant Sections: ${record.statuteInfo?.relevantSections.join(', ')}
Recommended Forum: ${record.statuteInfo?.recommendedForum}
Filing Fee: Rs.${record.statuteInfo?.filingFeeINR}
Limitation Period: ${record.statuteInfo?.limitationPeriodDays} days
Average Resolution: ${record.statuteInfo?.avgResolutionDays} days

PRECEDENT CASES:
${
  record.precedentCases
    ?.map((c) => `- ${c.caseName} (${c.citation}, ${c.court}, ${c.year}): ${c.keyHolding}`)
    .join('\n') ?? 'None available'
}

CASE ASSESSMENT: ${record.caseAssessment?.label ?? 'Not assessed'}
Key Strengths: ${record.caseAssessment?.strengths.join('; ') ?? 'None identified'}
Key Weaknesses: ${record.caseAssessment?.weaknesses.join('; ') ?? 'None identified'}
  `.trim();
}

export async function generateLegalNotice(record: DisputeRecord): Promise<string> {
  const context = buildContext(record);
  const completion = (await groqComplete(AGENT3_NOTICE_SYSTEM_PROMPT, context, false, 0.4)) as {
    choices: Array<{ message: { content: string } }>;
  };
  return completion.choices[0]?.message?.content ?? 'Legal notice generation failed.';
}

export async function generateForumComplaint(
  record: DisputeRecord,
  legalNotice: string
): Promise<string> {
  const context = `${buildContext(record)}

GENERATED LEGAL NOTICE (for consistency — use the same facts, dates, amounts, and legal theory):
${legalNotice}`;

  const completion = (await groqComplete(AGENT3_COMPLAINT_SYSTEM_PROMPT, context, false, 0.4)) as {
    choices: Array<{ message: { content: string } }>;
  };
  return completion.choices[0]?.message?.content ?? 'Forum complaint generation failed.';
}

export async function generateEvidenceChecklist(
  record: DisputeRecord,
  legalNotice: string,
  forumComplaint: string
): Promise<string> {
  const context = `${buildContext(record)}

GENERATED DOCUMENTS (reference these for evidence requirements):
--- LEGAL NOTICE ---
${legalNotice.slice(0, 2000)}
--- FORUM COMPLAINT ---
${forumComplaint.slice(0, 2000)}`;

  const completion = (await groqComplete(AGENT3_CHECKLIST_SYSTEM_PROMPT, context, false, 0.3)) as {
    choices: Array<{ message: { content: string } }>;
  };
  return completion.choices[0]?.message?.content ?? 'Evidence checklist generation failed.';
}

export async function generateCoachingSummary(
  record: DisputeRecord,
  legalNotice: string,
  forumComplaint: string,
  evidenceChecklist: string
): Promise<string> {
  const context = `${buildContext(record)}

GENERATED DOCUMENTS SUMMARY:
- Legal notice has been drafted citing ${record.statuteInfo?.actName ?? 'applicable law'}
- Forum complaint prepared for ${record.statuteInfo?.recommendedForum ?? 'appropriate forum'}
- Evidence checklist prepared

EVIDENCE CHECKLIST:
${evidenceChecklist.slice(0, 1500)}`;

  const completion = (await groqComplete(AGENT3_COACHING_SYSTEM_PROMPT, context, false, 0.6)) as {
    choices: Array<{ message: { content: string } }>;
  };
  return completion.choices[0]?.message?.content ?? 'Coaching summary generation failed.';
}

export async function reviseDocuments(
  record: DisputeRecord,
  originalNotice: string,
  originalComplaint: string,
  critique: AdversarialCritique
): Promise<{ revisedNotice: string; revisedComplaint: string }> {
  const context = `
${buildContext(record)}

ORIGINAL LEGAL NOTICE:
${originalNotice}

ORIGINAL FORUM COMPLAINT:
${originalComplaint}

ADVERSARIAL CRITIQUE FROM OPPOSING COUNSEL:
Wrong Citations: ${critique.wrongCitations.join(' | ')}
Procedural Vulnerabilities: ${critique.proceduralVulnerabilities.join(' | ')}
Factual Gaps: ${critique.factualGaps.join(' | ')}
Counter Narratives: ${critique.counterNarratives.join(' | ')}

Address every weakness above. Produce the revised legal notice first, then ===COMPLAINT_START===, then the revised complaint.
  `.trim();

  const completion = (await groqComplete(AGENT3_REVISION_SYSTEM_PROMPT, context, false, 0.3)) as {
    choices: Array<{ message: { content: string } }>;
  };

  const output = completion.choices[0]?.message?.content ?? '';
  const [revisedNotice, revisedComplaint] = output.split('===COMPLAINT_START===');

  return {
    revisedNotice: revisedNotice?.trim() ?? originalNotice,
    revisedComplaint: revisedComplaint?.trim() ?? originalComplaint,
  };
}

/**
 * Sequential document generation with shared context.
 *
 * This is the critical fix: documents are generated in order, each one
 * receiving the output of the previous as context. This ensures:
 * - Same facts cited in notice and complaint
 * - Same legal theory across all documents
 * - Evidence checklist references actual generated documents
 * - Coaching summary is grounded in everything above
 */
export async function generateAllDocuments(record: DisputeRecord): Promise<DocumentSet> {
  // Step 1: Legal notice first — this establishes the legal theory
  const legalNotice = await generateLegalNotice(record);

  // Step 2: Forum complaint WITH the notice as context — ensures consistency
  const forumComplaint = await generateForumComplaint(record, legalNotice);

  // Step 3: Evidence checklist references both documents
  const evidenceChecklist = await generateEvidenceChecklist(record, legalNotice, forumComplaint);

  // Step 4: Coaching summary references everything
  const coachingSummary = await generateCoachingSummary(
    record, legalNotice, forumComplaint, evidenceChecklist
  );

  return { legalNotice, forumComplaint, evidenceChecklist, coachingSummary };
}
