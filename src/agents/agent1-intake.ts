import { groqComplete } from '@/lib/groq';
import { AGENT1_SYSTEM_PROMPT } from '@/lib/prompts';
import { detectLanguage } from '@/lib/language';
import { stripJsonFences } from '@/lib/utils';
import { DisputeRecord } from '@/types';

export interface IntakeInput {
  text: string;
  evidenceItems: string[];
  amountInvolved?: number | null;
  incidentDate?: string | null;
}

export interface IntakeResult {
  status: 'success' | 'needs_clarification';
  disputeRecord?: DisputeRecord;
  clarifyingQuestions?: string[];
}

export async function runAgent1(input: IntakeInput): Promise<IntakeResult> {
  const detectedLang = detectLanguage(input.text);

  const userMessage = `
User's description of dispute:
${input.text}

Evidence items mentioned by user: ${input.evidenceItems.join(', ') || 'None specified'}
Amount involved: ${input.amountInvolved ? `Rs.${input.amountInvolved}` : 'Not specified'}
Date of incident: ${input.incidentDate ?? 'Not specified'}
Detected language: ${detectedLang}

Extract the DisputeRecord JSON as specified. If unclear, include clarifyingQuestions array with max 2 questions in the user's language (${detectedLang}).
  `.trim();

  const completion = (await groqComplete(AGENT1_SYSTEM_PROMPT, userMessage, false, 0.3)) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const cleaned = stripJsonFences(raw);

  let parsed: DisputeRecord & { clarifyingQuestions?: string[] };
  try {
    parsed = JSON.parse(cleaned) as DisputeRecord & { clarifyingQuestions?: string[] };
  } catch {
    throw new Error(`Agent 1 returned invalid JSON. Raw response: ${raw.substring(0, 200)}`);
  }

  parsed.originalLanguage = parsed.originalLanguage ?? detectedLang;

  const combinedEvidence = [...new Set([...(parsed.evidenceItems ?? []), ...input.evidenceItems])];
  parsed.evidenceItems = combinedEvidence;

  if (input.amountInvolved && !parsed.amountInvolved) {
    parsed.amountInvolved = input.amountInvolved;
  }
  if (input.incidentDate && !parsed.incidentDate) {
    parsed.incidentDate = input.incidentDate;
  }

  if (parsed.clarifyingQuestions && parsed.clarifyingQuestions.length > 0) {
    return {
      status: 'needs_clarification',
      clarifyingQuestions: parsed.clarifyingQuestions.slice(0, 2),
    };
  }

  return {
    status: 'success',
    disputeRecord: {
      complainantName: parsed.complainantName ?? 'Complainant',
      complainantAddress: parsed.complainantAddress ?? null,
      respondentName: parsed.respondentName ?? 'Respondent',
      respondentAddress: parsed.respondentAddress ?? null,
      disputeCategory: parsed.disputeCategory ?? 'consumer',
      amountInvolved: parsed.amountInvolved ?? null,
      incidentDate: parsed.incidentDate ?? null,
      evidenceItems: parsed.evidenceItems ?? [],
      originalLanguage: parsed.originalLanguage,
      rawInputTranslated: parsed.rawInputTranslated ?? input.text,
      summary: parsed.summary ?? 'Dispute details recorded.',
    },
  };
}
