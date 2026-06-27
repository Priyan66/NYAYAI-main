import { DisputeRecord, Landmine, CaseAssessment, CaseStrength } from '@/types';

/**
 * Honest case assessment.
 *
 * Instead of a fake percentage, we evaluate concrete factors and return
 * an explainable assessment. Every strength and weakness maps to a
 * specific fact the user provided (or failed to provide).
 */

interface Factor {
  positive: boolean;
  weight: 'high' | 'medium' | 'low';
  reason: string;
}

const STRONG_EVIDENCE = new Set([
  'salary_slip', 'written_contract', 'official_receipt', 'bank_statement',
  'warranty_card',
]);

const MODERATE_EVIDENCE = new Set([
  'email_correspondence', 'whatsapp_messages', 'video', 'photos',
]);

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

export function assessCaseStrength(record: DisputeRecord): CaseAssessment {
  const factors: Factor[] = [];

  // ── Evidence analysis ──────────────────────────────────────────────
  const normalizedEvidence = record.evidenceItems.map(normalizeLabel);
  const strongCount = normalizedEvidence.filter(e => STRONG_EVIDENCE.has(e)).length;
  const moderateCount = normalizedEvidence.filter(e => MODERATE_EVIDENCE.has(e)).length;
  const totalEvidence = normalizedEvidence.length;

  if (strongCount >= 2) {
    factors.push({
      positive: true, weight: 'high',
      reason: `You have ${strongCount} strong documentary evidence items (${normalizedEvidence.filter(e => STRONG_EVIDENCE.has(e)).join(', ').replace(/_/g, ' ')}). Courts give high weight to documentary proof.`,
    });
  } else if (strongCount === 1) {
    factors.push({
      positive: true, weight: 'medium',
      reason: `You have one strong evidence item. Consider gathering additional documentary proof to strengthen your position.`,
    });
  } else if (totalEvidence === 0) {
    factors.push({
      positive: false, weight: 'high',
      reason: 'No evidence items identified. Without documentary proof, the case relies entirely on oral testimony, which courts treat with caution.',
    });
  } else if (moderateCount > 0 && strongCount === 0) {
    factors.push({
      positive: false, weight: 'medium',
      reason: `Your evidence (${normalizedEvidence.join(', ').replace(/_/g, ' ')}) is informal. WhatsApp messages and photos help but are weaker than official documents. Get them notarized or certified.`,
    });
  }

  // ── Respondent identification ──────────────────────────────────────
  if (record.respondentName && record.respondentAddress) {
    factors.push({
      positive: true, weight: 'medium',
      reason: 'Respondent fully identified with name and address. Court notices can be served without delay.',
    });
  } else if (record.respondentName && !record.respondentAddress) {
    factors.push({
      positive: false, weight: 'medium',
      reason: 'Respondent address is missing. Without a service address, court notices cannot be delivered. Obtain the address before filing.',
    });
  } else {
    factors.push({
      positive: false, weight: 'high',
      reason: 'Respondent not clearly identified. The case cannot proceed without knowing who to file against.',
    });
  }

  // ── Limitation period ──────────────────────────────────────────────
  let limitationStatus: CaseAssessment['limitationStatus'] = 'unknown';
  let limitationDetail: string | null = null;

  if (record.incidentDate && record.statuteInfo) {
    const incident = new Date(record.incidentDate);
    const today = new Date();
    const daysSince = Math.floor((today.getTime() - incident.getTime()) / (1000 * 60 * 60 * 24));
    const limit = record.statuteInfo.limitationPeriodDays;
    const daysRemaining = limit - daysSince;

    if (daysRemaining > 90) {
      limitationStatus = 'within_time';
      limitationDetail = `${daysRemaining} days remaining to file. You have adequate time.`;
      factors.push({
        positive: true, weight: 'medium',
        reason: `Filing deadline is ${daysRemaining} days away. No urgency on limitation.`,
      });
    } else if (daysRemaining > 0) {
      limitationStatus = 'near_expiry';
      limitationDetail = `Only ${daysRemaining} days remaining. File immediately.`;
      factors.push({
        positive: false, weight: 'high',
        reason: `URGENT: Only ${daysRemaining} days left before the limitation period expires. File immediately or you may lose the right to legal remedy.`,
      });
    } else {
      limitationStatus = 'expired';
      limitationDetail = `Limitation expired ${Math.abs(daysRemaining)} days ago. Condonation of delay application required.`;
      factors.push({
        positive: false, weight: 'high',
        reason: `The limitation period expired ${Math.abs(daysRemaining)} days ago. You will need to file a condonation of delay application under Section 5 of the Limitation Act, 1963, with a valid reason for the delay.`,
      });
    }
  } else if (!record.incidentDate) {
    limitationStatus = 'unknown';
    limitationDetail = 'Incident date not provided. Cannot assess limitation period.';
    factors.push({
      positive: false, weight: 'low',
      reason: 'Incident date not specified. Provide the date to check if you are within the filing deadline.',
    });
  }

  // ── Amount and jurisdiction ────────────────────────────────────────
  if (record.amountInvolved && record.statuteInfo) {
    if (record.disputeCategory === 'consumer' && record.amountInvolved <= 5000000) {
      factors.push({
        positive: true, weight: 'low',
        reason: `Claim amount Rs.${record.amountInvolved.toLocaleString('en-IN')} is within District Consumer Commission jurisdiction (up to Rs.50 lakh). Filing fee is only Rs.${record.statuteInfo.filingFeeINR}.`,
      });
    } else if (record.disputeCategory === 'consumer' && record.amountInvolved > 5000000) {
      factors.push({
        positive: false, weight: 'medium',
        reason: `Claim amount Rs.${record.amountInvolved.toLocaleString('en-IN')} exceeds District Commission limit. Must file at State Commission (Rs.50L-2Cr) or National Commission (above Rs.2Cr).`,
      });
    }
  }

  // ── Category-specific factors ──────────────────────────────────────
  if (record.disputeCategory === 'consumer') {
    factors.push({
      positive: true, weight: 'low',
      reason: 'Consumer cases have a relatively high resolution rate. The Consumer Protection Act, 2019 is strongly pro-consumer.',
    });
  }

  if (record.disputeCategory === 'employment' && normalizedEvidence.includes('salary_slip')) {
    factors.push({
      positive: true, weight: 'high',
      reason: 'Salary slips directly prove the employment relationship and expected compensation. This is the strongest evidence for wage disputes.',
    });
  }

  if (record.disputeCategory === 'harassment') {
    factors.push({
      positive: false, weight: 'medium',
      reason: 'Harassment cases require strong corroborating evidence. Consider filing an FIR at the nearest police station as a parallel step.',
    });
  }

  // ── Compute overall strength ───────────────────────────────────────
  const strengths = factors.filter(f => f.positive).map(f => f.reason);
  const weaknesses = factors.filter(f => !f.positive).map(f => f.reason);

  const highPositive = factors.filter(f => f.positive && f.weight === 'high').length;
  const highNegative = factors.filter(f => !f.positive && f.weight === 'high').length;
  const medPositive = factors.filter(f => f.positive && f.weight === 'medium').length;
  const medNegative = factors.filter(f => !f.positive && f.weight === 'medium').length;

  let strength: CaseStrength;
  if (highNegative >= 2 || (highNegative >= 1 && medNegative >= 2)) {
    strength = 'challenging';
  } else if (highPositive >= 2 && highNegative === 0) {
    strength = 'strong';
  } else if (highPositive >= 1 && medPositive >= 1 && highNegative === 0) {
    strength = 'strong';
  } else {
    strength = 'moderate';
  }

  const labels: Record<CaseStrength, string> = {
    strong: 'Strong Position',
    moderate: 'Moderate Position — Addressable Gaps',
    challenging: 'Challenging — Critical Actions Needed',
  };

  // ── Critical actions ───────────────────────────────────────────────
  const criticalActions: string[] = [];

  if (!record.respondentAddress) {
    criticalActions.push('Obtain respondent\'s full address before filing. Check MCA website (mca.gov.in) for company registration, or use the address on any receipt/contract.');
  }
  if (limitationStatus === 'near_expiry') {
    criticalActions.push('File immediately — your limitation period is about to expire.');
  }
  if (limitationStatus === 'expired') {
    criticalActions.push('Prepare a condonation of delay application with a valid reason for late filing.');
  }
  if (totalEvidence === 0) {
    criticalActions.push('Gather any documentary evidence: receipts, messages, contracts, bank statements. Your case needs proof.');
  }
  if (strongCount === 0 && moderateCount > 0) {
    criticalActions.push('Get your informal evidence (WhatsApp messages, photos) notarized or certified to increase their evidentiary weight.');
  }

  return {
    strength,
    label: labels[strength],
    strengths,
    weaknesses,
    criticalActions,
    limitationStatus,
    limitationDetail,
  };
}

// Keep detectLandmines — it's deterministic and useful
export function detectLandmines(record: DisputeRecord): Landmine[] {
  const landmines: Landmine[] = [];
  const today = new Date();

  if (record.incidentDate && record.statuteInfo) {
    const incident = new Date(record.incidentDate);
    const expiryDate = new Date(incident.getTime() + record.statuteInfo.limitationPeriodDays * 86400000);
    if (expiryDate < today) {
      landmines.push({
        type: 'limitation_expired',
        description: `The limitation period of ${record.statuteInfo.limitationPeriodDays} days has expired. Your incident date was ${record.incidentDate} and the deadline was ${expiryDate.toISOString().split('T')[0]}.`,
        remedy:
          'File an application for condonation of delay under Section 5 of the Limitation Act, 1963, explaining the sufficient cause for delay. Courts have discretion to condone delay.',
      });
    }
  }

  if (record.disputeCategory === 'consumer' && record.amountInvolved && record.amountInvolved > 5000000) {
    landmines.push({
      type: 'wrong_forum',
      description: `Claim amount Rs.${record.amountInvolved.toLocaleString('en-IN')} exceeds Rs.50 lakh. District Consumer Commission jurisdiction limit is Rs.50 lakh.`,
      remedy:
        'File at State Consumer Disputes Redressal Commission (Rs.50L-Rs.2Cr) or National Consumer Disputes Redressal Commission (above Rs.2Cr) depending on amount.',
    });
  }

  if (['consumer', 'employment'].includes(record.disputeCategory)) {
    landmines.push({
      type: 'missing_prerequisite',
      description:
        'Consumer and employment cases are strengthened by sending a formal legal notice before filing. There is no record of prior notice having been sent.',
      remedy:
        'Send the legal notice generated by NYAY FIGHT to the respondent. Wait 15 days. If no satisfactory response, file the complaint. This prior notice strengthens your case significantly.',
    });
  }

  if (!record.respondentAddress) {
    landmines.push({
      type: 'identity_gap',
      description:
        'Respondent address is missing. Without a valid service address, the court notice cannot be served and the case cannot proceed.',
      remedy:
        'Obtain address from: company registration (Ministry of Corporate Affairs website - mca.gov.in), consumer complaint receipt, product packaging, or by visiting the registered office in person.',
    });
  }

  return landmines;
}
