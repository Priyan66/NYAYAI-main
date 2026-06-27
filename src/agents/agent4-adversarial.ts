import { groqComplete } from '@/lib/groq';
import { AGENT4_ADVERSARIAL_SYSTEM_PROMPT } from '@/lib/prompts';
import { AdversarialCritique } from '@/types';
import { stripJsonFences } from '@/lib/utils';

export async function runAgent4(
  legalNotice: string,
  forumComplaint: string
): Promise<AdversarialCritique> {
  const userMessage = `
LEGAL NOTICE TO ATTACK:
${legalNotice}

FORUM COMPLAINT TO ATTACK:
${forumComplaint}

Identify every weakness, procedural error, and exploitable gap. Output only JSON.
  `.trim();

  const completion = (await groqComplete(
    AGENT4_ADVERSARIAL_SYSTEM_PROMPT,
    userMessage,
    false,
    0.5
  )) as { choices: Array<{ message: { content: string } }> };

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const cleaned = stripJsonFences(raw);

  try {
    const parsed = JSON.parse(cleaned) as AdversarialCritique;
    return {
      wrongCitations: parsed.wrongCitations ?? ['No issues found in citations'],
      proceduralVulnerabilities:
        parsed.proceduralVulnerabilities ?? ['No procedural issues found'],
      factualGaps: parsed.factualGaps ?? ['No factual gaps found'],
      counterNarratives: parsed.counterNarratives ?? ['No counter narratives identified'],
    };
  } catch {
    return {
      wrongCitations: ['Citation analysis unavailable'],
      proceduralVulnerabilities: ['Procedural analysis unavailable'],
      factualGaps: ['Factual analysis unavailable'],
      counterNarratives: ['Counter-narrative analysis unavailable'],
    };
  }
}
