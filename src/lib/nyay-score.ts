import { NyayScoreResult, ScoreDimension, ActionItem, UploadedDocument } from '@/types';
import { groqComplete } from './groq';
import { NYAY_SCORE_ANALYSIS_SYSTEM_PROMPT } from './prompts';

interface DocumentAnalysis {
  protectiveClausesPresent: string[];
  predatoryClausesFound: string[];
  employmentFlags: string[];
  tenancyFlags: string[];
  overallRisk: 'low' | 'medium' | 'high';
  summary: string;
}

async function analyzeDocumentText(text: string): Promise<DocumentAnalysis> {
  const completion = (await groqComplete(
    NYAY_SCORE_ANALYSIS_SYSTEM_PROMPT,
    `Analyze this document:\n\n${text.substring(0, 6000)}`,
    false,
    0.2
  )) as { choices: Array<{ message: { content: string } }> };

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned) as DocumentAnalysis;
  } catch {
    return {
      protectiveClausesPresent: [],
      predatoryClausesFound: [],
      employmentFlags: [],
      tenancyFlags: [],
      overallRisk: 'medium',
      summary: 'Analysis could not be completed.',
    };
  }
}

export async function calculateNyayScore(
  uploadedDocuments: UploadedDocument[],
  questionnaire?: Record<string, boolean>
): Promise<NyayScoreResult> {
  const combinedText = uploadedDocuments
    .filter((d) => d.parseSuccess)
    .map((d) => d.extractedText)
    .join('\n\n---\n\n');

  let analysis: DocumentAnalysis = {
    protectiveClausesPresent: [],
    predatoryClausesFound: [],
    employmentFlags: [],
    tenancyFlags: [],
    overallRisk: 'medium',
    summary: '',
  };

  if (combinedText.length > 100) {
    analysis = await analyzeDocumentText(combinedText);
  }

  let contractSafety = 50;
  contractSafety += analysis.protectiveClausesPresent.length * 15;
  contractSafety -= analysis.predatoryClausesFound.length * 20;
  contractSafety = Math.min(100, Math.max(0, contractSafety));

  let tenancyProtection = 0;
  const tenancyPositive = analysis.tenancyFlags.filter((f) => !f.toLowerCase().startsWith('missing'));
  tenancyProtection = tenancyPositive.length * 20;
  tenancyProtection = Math.min(100, Math.max(0, tenancyProtection));

  let employmentSecurity = 0;
  const employmentPositive = analysis.employmentFlags.filter((f) => !f.toLowerCase().startsWith('missing'));
  employmentSecurity = employmentPositive.length * 16;
  employmentSecurity = Math.min(100, Math.max(0, employmentSecurity));

  let consumerRights = 100;
  if (questionnaire) {
    if (questionnaire.hasUnresolvedPurchase) consumerRights -= 25;
    if (questionnaire.hasUnresolvedService) consumerRights -= 25;
    if (questionnaire.hasExpiringClaim) consumerRights -= 40;
  }
  consumerRights = Math.min(100, Math.max(0, consumerRights));

  let digitalRights = 100;
  if (questionnaire) {
    const appsWithViolations = questionnaire.appsWithExcessivePermissions ? 3 : 0;
    digitalRights -= appsWithViolations * 15;
  }
  digitalRights = Math.min(100, Math.max(0, digitalRights));

  let familyDocumentation = 0;
  if (questionnaire) {
    if (questionnaire.hasWill) familyDocumentation += 30;
    if (questionnaire.hasNominee) familyDocumentation += 25;
    if (questionnaire.hasHealthPOA) familyDocumentation += 20;
    if (questionnaire.hasGuardianship) familyDocumentation += 25;
  }
  familyDocumentation = Math.min(100, Math.max(0, familyDocumentation));

  const totalScore =
    contractSafety +
    tenancyProtection +
    employmentSecurity +
    consumerRights +
    digitalRights +
    familyDocumentation;

  const getLabelAndColor = (
    score: number
  ): { label: NyayScoreResult['label']; labelColor: NyayScoreResult['labelColor'] } => {
    if (score <= 200) return { label: 'Significantly Vulnerable', labelColor: 'red' };
    if (score <= 350) return { label: 'Moderately Protected', labelColor: 'amber' };
    return { label: 'Well Protected', labelColor: 'green' };
  };

  const dimensions: ScoreDimension[] = [
    {
      key: 'contractSafety',
      label: 'Contract Safety',
      score: contractSafety,
      maxScore: 100,
      urgentAction:
        contractSafety < 60
          ? 'Add: "Either party may terminate with 30 days written notice for any reason."'
          : 'Contracts appear reasonably protective.',
      detailItems: analysis.protectiveClausesPresent,
    },
    {
      key: 'tenancyProtection',
      label: 'Tenancy Protection',
      score: tenancyProtection,
      maxScore: 100,
      urgentAction:
        tenancyProtection < 60
          ? 'Request landlord to add a 30-day eviction notice clause and enumerate deposit deduction grounds.'
          : 'Rental agreement appears protective.',
      detailItems: analysis.tenancyFlags,
    },
    {
      key: 'employmentSecurity',
      label: 'Employment Security',
      score: employmentSecurity,
      maxScore: 100,
      urgentAction:
        employmentSecurity < 60
          ? 'Negotiate: employer must give equal notice period; IP assignment limited to role-related work only.'
          : 'Employment terms appear reasonable.',
      detailItems: analysis.employmentFlags,
    },
    {
      key: 'consumerRights',
      label: 'Consumer Rights',
      score: consumerRights,
      maxScore: 100,
      urgentAction:
        consumerRights < 60
          ? 'You have unresolved consumer complaints. Use NYAY FIGHT to generate notices now.'
          : 'No urgent consumer issues detected.',
      detailItems: [],
    },
    {
      key: 'digitalRights',
      label: 'Digital Rights',
      score: digitalRights,
      maxScore: 100,
      urgentAction:
        digitalRights < 60
          ? "Review app permissions under DPDP 2023. Revoke contact/location access for apps that don't need it."
          : 'Digital rights appear protected.',
      detailItems: [],
    },
    {
      key: 'familyDocumentation',
      label: 'Family Documentation',
      score: familyDocumentation,
      maxScore: 100,
      urgentAction:
        familyDocumentation < 60
          ? 'Draft a simple Will and update nominees on your bank accounts, FDs, and insurance policies.'
          : 'Family documentation appears adequate.',
      detailItems: [],
    },
  ];

  const actionItems: ActionItem[] = dimensions
    .filter((d) => d.score < 60)
    .slice(0, 3)
    .map((d) => ({
      dimension: d.key,
      action: d.urgentAction,
      scoreDelta: Math.round((60 - d.score) * 0.7),
      estimatedMinutes: d.key === 'familyDocumentation' ? 45 : d.key === 'digitalRights' ? 10 : 30,
    }));

  return {
    totalScore,
    ...getLabelAndColor(totalScore),
    dimensions,
    actionItems,
    scannedAt: new Date().toISOString(),
    uploadedDocuments,
  };
}
