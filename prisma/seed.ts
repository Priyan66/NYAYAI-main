import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { dateMonthsAgo } from '../src/lib/utils';
import { DisputeRecord, AdversarialCritique } from '../src/types';

const prisma = new PrismaClient();

const hashPassword = (password: string) =>
  createHash('sha256')
    .update(`${password}${process.env.NEXTAUTH_SECRET ?? 'dev-secret'}`)
    .digest('hex');

const employmentNotice = `BEFORE THE PAYMENT OF WAGES AUTHORITY / LABOUR COURT, MUMBAI

LEGAL NOTICE
Date: ${new Date().toISOString().split('T')[0]}

To,
Rajesh Traders
Registered Office: Shop No. 14, Dadar Market Road, Dadar West, Mumbai - 400028

Subject: Legal Notice under Payment of Wages Act, 1936 Section 3, Section 7 and Section 15

Sir/Madam,

Under instructions and on behalf of my client Ms. Meena Sharma, resident of Room No. 6, Shanti Nagar Chawl, Kurla East, Mumbai - 400024, I hereby serve upon you this legal notice regarding unlawful withholding of earned wages amounting to Rs.32,000. My client was engaged by your establishment as a sales and inventory assistant on a monthly wage arrangement, and she diligently discharged all assigned responsibilities from opening duty, stock entries, customer billing support, and end-of-day register reconciliation. Despite repeated assurances made by your proprietor and manager through WhatsApp communication and oral promises at the workplace, wages for four completed months have not been paid.

It is a matter of record that salary slips were issued for the relevant period and your own messages acknowledge both employment and pending dues. My client continued to report for duty in good faith because she was assured that payment would be made "next week" and that temporary business cash flow difficulty was the only reason for delay. Instead of honoring lawful wage obligations, your management continued taking full labor output while deferring salary, thereby causing serious financial hardship, rent default risk, and emotional distress to a low-income worker dependent entirely on monthly wages for subsistence.

Your conduct constitutes direct violation of statutory obligations under Section 3 of the Payment of Wages Act, 1936, which fixes responsibility for payment of wages on the employer; Section 7, which narrowly regulates deductions and does not permit indefinite withholding; and Section 15, under which delayed or deducted wages may be claimed before the competent authority with compensation. The Supreme Court in Workmen of Firestone Tyre and Rubber Co. v. Management (AIR 1973 SC 1227) has affirmed that wages cannot be withheld without lawful authority and procedural fairness. Your present conduct falls squarely within unlawful non-payment.

Accordingly, you are called upon to comply within 15 (fifteen) days from receipt of this notice and pay the total outstanding wages of Rs.32,000 along with applicable statutory compensation for delayed payment, and issue written confirmation of regularized wage process for future cycles. You are further called upon to preserve attendance records, wage registers, payment vouchers, and WhatsApp communications relevant to employment and dues.

Take notice that in the event of non-compliance within the stipulated period, my client shall be constrained to institute proceedings before the Payment of Wages Authority / Labour Court, Mumbai, at your sole risk as to costs, compensation, interest, and all legal consequences. This notice is issued without prejudice to all other civil and statutory remedies available in law.

Complainant:
Ms. Meena Sharma
Room No. 6, Shanti Nagar Chawl, Kurla East, Mumbai - 400024

Enclosures:
1. Salary slips for four months
2. WhatsApp chats confirming employment and wage dues
3. Bank statement showing non-credit of salary
4. Attendance notes maintained by employee
`;

const employmentComplaint = `BEFORE THE PAYMENT OF WAGES AUTHORITY / LABOUR COURT, MUMBAI

Complaint under Section 15 of the Payment of Wages Act, 1936

Complainant: Ms. Meena Sharma, Room No. 6, Shanti Nagar Chawl, Kurla East, Mumbai - 400024.
Respondent: Rajesh Traders, Shop No. 14, Dadar Market Road, Dadar West, Mumbai - 400028.

1. The complainant is a wage employee who was engaged by the respondent establishment as a sales and inventory assistant and worked continuously during the relevant wage period.
2. The respondent is the person responsible for wage disbursement and maintenance of wage records, attendance records, and payment compliance under applicable labour law.
3. This Hon'ble Authority has territorial and subject-matter jurisdiction because the complainant worked within Mumbai and wage default occurred within this jurisdiction.
4. The complainant rendered services honestly and satisfactorily and fulfilled all assigned work responsibilities for four wage cycles.
5. Monthly wages were not paid for four months despite repeated oral assurances and written WhatsApp confirmation from respondent management.
6. The total unpaid amount due and payable to the complainant is Rs.32,000.
7. Salary slips and communication evidence establish employer-employee relationship and admitted liability.
8. A formal legal notice dated ${new Date().toISOString().split('T')[0]} was issued demanding payment within fifteen days; no lawful settlement was provided.
9. Non-payment of wages violates Section 3 and Section 7 of the Payment of Wages Act, 1936 and entitles the complainant to relief under Section 15.
10. The respondent has caused severe financial hardship and compelled the complainant to borrow for rent and essentials.
11. The complainant craves leave to rely upon salary slips, WhatsApp messages, and corroborative records at the time of hearing.

Legal Grounds:
A. Under Section 3 of the Payment of Wages Act, the respondent is statutorily liable to ensure timely wage payment.
B. Under Section 7, unlawful deduction or withholding outside permitted categories is prohibited.
C. Under Section 15, this Authority is empowered to direct payment of delayed wages with compensation.
D. The legal principle in Workmen of Firestone Tyre and Rubber Co. v. Management supports strict employer accountability for wage payment.

Reliefs Sought:
(i) Direction to respondent to pay Rs.32,000 towards unpaid wages forthwith.
(ii) Award of statutory compensation for delayed payment as deemed fit by this Authority.
(iii) Cost of proceedings and litigation expenses.
(iv) Any other order in the interest of justice.

Verification:
I, Meena Sharma, do hereby verify that the contents of the above complaint are true and correct to the best of my knowledge and belief.

Date: ${new Date().toISOString().split('T')[0]}
Place: Mumbai

Signature:
Meena Sharma
Complainant
`;

const employmentRevisedNotice = `BEFORE THE PAYMENT OF WAGES AUTHORITY / LABOUR COURT, MUMBAI

REVISED LEGAL NOTICE
Date: ${new Date().toISOString().split('T')[0]}

To,
Rajesh Traders
Registered Office: Shop No. 14, Dadar Market Road, Dadar West, Mumbai - 400028

Subject: Final Legal Notice under Sections 3, 7 and 15 of the Payment of Wages Act, 1936 for immediate release of admitted wage dues

Sir/Madam,

This revised and final legal notice is issued on behalf of Ms. Meena Sharma in continuation of prior demand and in response to your continued non-compliance. Your establishment engaged my client as a wage employee and received full labor services across four completed wage months. Salary slips issued by your office, contemporaneous WhatsApp acknowledgments from authorized managerial numbers, and attendance-linked work records jointly establish (a) employment relationship, (b) period of service, and (c) exact wage liability of Rs.32,000.

You have neither disputed employment nor produced any lawful basis for withholding payment. No suspension order, disciplinary finding, or authorized deduction statement has been communicated to my client. In labour law, the burden to justify deduction or delay lies squarely on the employer. Your repeated verbal assurances of payment by "next week" constitute admissions of debt and negate any later attempt to deny liability.

Your conduct violates Section 3 of the Payment of Wages Act, 1936 by failure of the person responsible to ensure wage disbursement within statutory timelines. It violates Section 7 by treating wages as indefinitely deferable despite absence of legally recognized deductions. Relief under Section 15 is therefore fully attracted, including direction for wage payment and compensation. The Supreme Court in Workmen of Firestone Tyre and Rubber Co. v. Management (AIR 1973 SC 1227) recognized that withholding earned wages without legal authority is unlawful and actionable.

You are hereby granted a final period of 15 days from service of this notice to: (1) remit Rs.32,000 by bank transfer to my client, (2) provide written wage computation sheet month-wise, (3) issue confirmation that future wage cycles will be paid within statutory timelines, and (4) preserve and produce wage register, attendance register, and communication records when called upon. Failure to comply shall compel immediate institution of claim proceedings before the competent labour forum with prayer for wage amount, compensation, litigation cost, and all consequential relief.

Please note that this notice, together with evidence of service and your inaction, shall be relied upon to establish willful default and to seek adverse inference against your establishment. All rights and remedies remain expressly reserved.

Complainant:
Ms. Meena Sharma
Room No. 6, Shanti Nagar Chawl, Kurla East, Mumbai - 400024

Enclosures:
1. Salary slips
2. WhatsApp message chain
3. Bank non-credit extract
4. Prior notice and proof of dispatch
`;

const employmentRevisedComplaint = `${employmentComplaint}

ADDITIONAL PARTICULARS IN REVISION:
12. The respondent's WhatsApp admissions dated within the relevant wage cycle expressly confirm that payment was pending and would be released shortly.
13. No lawful deduction head under Section 7 has been communicated in writing.
14. The complainant seeks compensation considering prolonged delay and hardship.
`;

const employmentChecklist = `✓ HAVE Salary slips for all 4 months
  Tip: Ensure each slip shows registered employer name and aligns with PF/UAN records where applicable.
✓ HAVE WhatsApp messages confirming dues
  Tip: Capture a continuous screen recording from chat list to message details and get hash-certified by notary.
✓ HAVE Bank statement for non-credit period
  Tip: Highlight salary expected dates and corresponding non-credit entries.
✗ NEED Attendance register copy or shift logs
  How to obtain: Request certified copy from employer in writing; if refused, mention in complaint for adverse inference.
✗ NEED Co-worker corroboration statement
  How to obtain: Ask one co-worker to provide a signed one-page statement with ID proof copy.
`;

const employmentCoachingHindi = `आपकी सबसे मजबूत बात / Your Strongest Point
आपके पास salary slips और WhatsApp chats दोनों हैं। इसका मतलब employment relationship और pending dues दोनों साबित होते हैं। यह बहुत मजबूत evidence है।

आपकी कमज़ोरी / Your Weakest Point
Respondent address serve होने लायक सटीक होना चाहिए। अगर notice सही पते पर नहीं गया तो case की शुरुआत में delay हो सकता है।

अगले 7 दिनों का प्लान / Next 7 Days Action Plan
1. Legal notice की speed post receipt और tracking report सुरक्षित रखें।
2. WhatsApp evidence का screen recording + notary hash certification कराएं।
3. Bank statement में unpaid months highlight करके एक summary sheet बनाएं।
4. एक witness statement arrange करें जो आपके काम करने की पुष्टि करे।
5. Complaint filing set तैयार करके Labour Court Mumbai में filing date लें।

फोरम का माहौल कैसा होता है / What the Forum Process Feels Like
पहले दिन registry scrutiny होती है, फिर notice issue होता है। शुरू में technical सवाल आते हैं, घबराना नहीं है। Documents organized होंगे तो hearing smooth रहती है।

यथार्थवादी समयसीमा / Realistic Timeline
अगर respondent जल्दी settle करना चाहे तो 30-45 दिन में payment हो सकती है। Contested matter में 2-4 महीने लग सकते हैं।

पहले दिन क्या लेकर जाएं / What to Bring on Day 1
Original salary slips, printed WhatsApp transcript, bank statement, ID proof, address proof, speed post proof और complaint की 3 signed copies लेकर जाएं।`;

const employmentCritique: AdversarialCritique = {
  wrongCitations: [
    'Original draft did not expressly tie wage default timeline to statutory payment window under Section 3.',
    'No explicit month-wise wage computation table was referenced in the first notice.',
  ],
  proceduralVulnerabilities: [
    'Service proof details were weakly pleaded; courier acknowledgment not explicitly referred.',
    'Complaint lacked explicit prayer for costs and compensation in separate clauses.',
  ],
  factualGaps: [
    'No paragraph identifying designated manager who admitted dues on WhatsApp.',
    'No statement on absence of lawful deductions under Section 7 in writing.',
  ],
  counterNarratives: [
    'Employer may allege worker absenteeism to justify withholding wages.',
    'Employer may claim cash payment was offered but not collected by employee.',
  ],
};

const consumerNotice = `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION, DELHI

LEGAL NOTICE
Date: ${new Date().toISOString().split('T')[0]}

To,
CoolAir India Pvt. Ltd.
Registered Office: Plot 52, Okhla Industrial Estate, Phase II, New Delhi - 110020

Subject: Legal Notice under Consumer Protection Act, 2019 Section 2(7), Section 35, Section 38 and Section 39

Sir/Madam,

Under instructions from my client Mr. Arjun Malhotra, resident of B-112, Lajpat Nagar II, New Delhi - 110024, this legal notice is issued regarding your prolonged deficiency in after-sales service for a refrigerator purchased for Rs.45,000 under valid warranty. The appliance suffered compressor and cooling failure within the warranty period. Multiple service requests were raised through your helpline and service portal over the last two months, and each complaint was either marked "pending part" or "technician revisit" without effective repair or replacement.

My client complied with every requested step: invoice submission, warranty card upload, serial number verification, repeated telephonic coordination, and physical availability for technician visits. Yet your service representatives repeatedly postponed service, gave contradictory explanations, and failed to provide a final resolution. The product remains unusable, causing food spoilage, daily inconvenience, and financial loss in a household dependent on functioning refrigeration.

Your conduct squarely constitutes "deficiency in service" within the meaning of Section 2(7) read with the remedial framework under Sections 35, 38 and 39 of the Consumer Protection Act, 2019. Once a defect is reported during warranty and acknowledged by the manufacturer or authorized service partner, the consumer cannot be made to suffer indefinite delay. In Lucknow Development Authority v. M.K. Gupta ((1994) 1 SCC 243), the Supreme Court held that failure in promised public-facing service obligations gives rise to actionable consumer deficiency and compensation consequences.

You are therefore called upon, within 15 days of receipt of this notice, to (i) repair the appliance to full functional condition at no additional charge or provide equivalent replacement unit, (ii) pay Rs.45,000 in the alternative where repair/replacement is not completed within timeline, (iii) compensate my client for harassment and inconvenience, and (iv) issue written assurance of closure with service report.

Take further notice that on failure to comply, my client shall institute consumer complaint proceedings before the District Consumer Disputes Redressal Commission, Delhi, seeking refund/replacement, compensation, litigation cost, and all ancillary relief at your sole risk as to cost and consequences. This notice is without prejudice to all rights available in law.

Complainant:
Mr. Arjun Malhotra
B-112, Lajpat Nagar II, New Delhi - 110024

Enclosures:
1. Purchase invoice
2. Warranty card
3. Service request logs and complaint numbers
4. Email and call summary correspondence
`;

const consumerComplaint = `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION, DELHI

Complaint under Section 35 of the Consumer Protection Act, 2019

Complainant: Mr. Arjun Malhotra, B-112, Lajpat Nagar II, New Delhi - 110024.
Respondent: CoolAir India Pvt. Ltd., Plot 52, Okhla Industrial Estate, Phase II, New Delhi - 110020.

1. The complainant purchased a refrigerator manufactured and serviced by the respondent for Rs.45,000.
2. The product was sold with active warranty and respondent's assurance of prompt service support.
3. The complainant is a consumer under Section 2(7) of the Consumer Protection Act, 2019.
4. Within warranty period, the appliance developed major cooling and compressor defects.
5. The complainant raised repeated service tickets and followed all respondent procedures.
6. Respondent's technicians either did not complete repair or postponed with indefinite timelines.
7. The refrigerator remained unusable for approximately two months despite acknowledged complaints.
8. The complainant suffered inconvenience, food spoilage losses, and mental harassment.
9. Legal notice dated ${new Date().toISOString().split('T')[0]} was issued and no satisfactory final remedy was delivered.
10. Cause of action is continuing due to respondent's failure to repair, replace, or refund.
11. This Hon'ble Commission has jurisdiction as transaction and service deficiency arose in Delhi and claim value falls within district pecuniary threshold.

Legal Grounds:
A. Respondent committed deficiency in service under the Consumer Protection Act, 2019.
B. Under Sections 35 and 38, complaint is maintainable and triable before this Commission.
C. Under Section 39, complainant is entitled to replacement/refund and compensation.
D. Judicial guidance in Lucknow Development Authority v. M.K. Gupta supports compensation for deficient service.

Reliefs Sought:
(i) Direction to replace the defective refrigerator with new equivalent model or refund Rs.45,000.
(ii) Compensation for harassment, inconvenience, and consequential loss.
(iii) Litigation expenses and costs.
(iv) Any further relief this Hon'ble Commission deems fit.

Verification:
I, Arjun Malhotra, do hereby verify that the contents of the above complaint are true and correct to the best of my knowledge and belief.

Date: ${new Date().toISOString().split('T')[0]}
Place: Delhi

Signature:
Arjun Malhotra
Complainant
`;

const consumerRevisedNotice = `${consumerNotice}
ADDITIONAL FINAL DEMAND:
The respondent shall also provide documented root-cause report, part replacement history, and escalation matrix details to prevent repetition of deficiency.`;

const consumerRevisedComplaint = `${consumerComplaint}

ADDITIONAL PARTICULARS IN REVISION:
12. The respondent's ticket history demonstrates repeated closure without resolution.
13. The complainant relies on call logs and email reminders showing persistent follow-up.
`;

const consumerChecklist = `✓ HAVE Purchase invoice
  Tip: Keep original invoice and one self-attested photocopy for filing bundle.
✓ HAVE Warranty card
  Tip: Pair warranty card with invoice and product serial photo for authentication.
✓ HAVE Service complaint numbers
  Tip: Export ticket history and screenshot each status transition with date/time.
✓ HAVE Email correspondence
  Tip: Print full email headers to establish timeline and recipient domain.
✗ NEED Technician visit report copies
  How to obtain: Email respondent customer support requesting signed service reports for each visit.
`;

const consumerCoachingEnglish = `Your Strongest Point
You are clearly a consumer with a valid invoice, warranty card, and repeated unresolved service logs. This is exactly the pattern consumer commissions treat as strong deficiency in service.

Your Weakest Point
Your claim is strongest when every follow-up is date-stamped. If service calls are only verbal and not documented, the respondent may deny delay history.

Next 7 Days Action Plan
1. Compile invoice, warranty card, and product serial photo in one indexed folder.
2. Export all complaint ticket screenshots and place them in chronological order.
3. Send one final email demanding replacement/refund within 15 days.
4. Prepare a one-page loss summary (food spoilage and inconvenience timeline).
5. File complaint at District Commission Delhi with 3 complete paper sets.

What the Forum Process Feels Like
The first stage is filing scrutiny and admission. After notice, many companies try settlement. If they contest, documentary timeline becomes your biggest weapon.

Realistic Timeline
A practical range is 2-4 months for meaningful interim movement, with faster settlement possible once notice is served.

What to Bring on Day 1
Bring originals plus copies of invoice, warranty card, service logs, email trail, ID proof, address proof, and signed complaint set.`;

const consumerCritique: AdversarialCritique = {
  wrongCitations: [
    'Initial draft did not expressly map requested remedies to Section 39 sub-reliefs.',
    'The first notice mentioned deficiency but omitted explicit jurisdiction value statement.',
  ],
  proceduralVulnerabilities: [
    'Relief for litigation cost was not separately itemized in first complaint draft.',
    'No explicit mention of proof of service of legal notice in initial pleading.',
  ],
  factualGaps: [
    'No serial-number reference in opening facts left room for model mismatch defence.',
    'No quantified inconvenience period in days was pleaded initially.',
  ],
  counterNarratives: [
    'Company may claim spare part import delay beyond control to justify timelines.',
    'Company may assert consumer denied technician entry on at least one visit.',
  ],
};

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@nyay.ai' },
    update: {
      name: 'NYAY Demo User',
      passwordHash: hashPassword('DemoPass123!'),
      language: 'en',
    },
    create: {
      email: 'demo@nyay.ai',
      name: 'NYAY Demo User',
      passwordHash: hashPassword('DemoPass123!'),
      language: 'en',
    },
  });

  await prisma.dispute.deleteMany({
    where: {
      userId: user.id,
      originalInput: {
        in: ['SEED_EMPLOYMENT_MEENA', 'SEED_CONSUMER_ARJUN'],
      },
    },
  });

  const employmentRecord: DisputeRecord = {
    complainantName: 'Meena Sharma',
    complainantAddress: 'Room No. 6, Shanti Nagar Chawl, Kurla East, Mumbai - 400024',
    respondentName: 'Rajesh Traders',
    respondentAddress: 'Shop No. 14, Dadar Market Road, Dadar West, Mumbai - 400028',
    disputeCategory: 'employment',
    amountInvolved: 32000,
    incidentDate: dateMonthsAgo(4),
    evidenceItems: ['salary_slip', 'whatsapp_messages', 'bank_statement'],
    originalLanguage: 'hi',
    rawInputTranslated:
      'My employer has not paid my salary for four months and Rs.32,000 is pending. I have salary slips and WhatsApp chats confirming my employment.',
    summary:
      'Employment wage default for four months with admitted employer relationship. Complainant seeks recovery of unpaid wages and compensation for delay.',
    statuteInfo: {
      category: 'employment',
      actName: 'Payment of Wages Act, 1936 and Industrial Disputes Act, 1947',
      relevantSections: ['Section 3', 'Section 7', 'Section 15', 'Section 20 of Payment of Wages Act, 1936'],
      recommendedForum: 'Payment of Wages Authority / Labour Court',
      limitationPeriodDays: 365,
      filingFeeINR: 0,
      avgResolutionDays: 60,
    },
    precedentCases: [
      {
        caseName: 'Workmen of Firestone Tyre and Rubber Co. v. Management',
        citation: 'AIR 1973 SC 1227',
        court: 'Supreme Court of India',
        year: 1973,
        outcome: 'plaintiff_won',
        filingFee: 0,
        keyHolding: 'Employer cannot withhold wages without lawful authority and proper procedure.',
      },
      {
        caseName: 'D.K. Yadav v. J.M.A. Industries Ltd.',
        citation: '(1993) 3 SCC 259',
        court: 'Supreme Court of India',
        year: 1993,
        outcome: 'plaintiff_won',
        filingFee: 0,
        keyHolding: 'Termination without notice and payment of dues is illegal under industrial law.',
      },
    ],
    successProbability: 74,
    landmines: [],
    clarifyingQuestions: [],
  };

  const consumerRecord: DisputeRecord = {
    complainantName: 'Arjun Malhotra',
    complainantAddress: 'B-112, Lajpat Nagar II, New Delhi - 110024',
    respondentName: 'CoolAir India Pvt Ltd',
    respondentAddress: 'Plot 52, Okhla Industrial Estate, Phase II, New Delhi - 110020',
    disputeCategory: 'consumer',
    amountInvolved: 45000,
    incidentDate: dateMonthsAgo(2),
    evidenceItems: ['warranty_card', 'official_receipt', 'email_correspondence'],
    originalLanguage: 'en',
    rawInputTranslated:
      'My refrigerator under warranty has not been repaired for two months despite repeated complaints to CoolAir support.',
    summary:
      'Consumer warranty deficiency where service provider failed to repair or replace a defective refrigerator. Complainant seeks replacement or refund and compensation.',
    statuteInfo: {
      category: 'consumer',
      actName: 'Consumer Protection Act, 2019',
      relevantSections: ['Section 2(7)', 'Section 35', 'Section 38', 'Section 39'],
      recommendedForum: 'District Consumer Disputes Redressal Commission',
      limitationPeriodDays: 730,
      filingFeeINR: 200,
      avgResolutionDays: 90,
    },
    precedentCases: [
      {
        caseName: 'Lucknow Development Authority v. M.K. Gupta',
        citation: '(1994) 1 SCC 243',
        court: 'Supreme Court of India',
        year: 1994,
        outcome: 'plaintiff_won',
        filingFee: 200,
        keyHolding: "Housing authority's failure to deliver possession is deficiency of service.",
      },
      {
        caseName: 'Ghaziabad Development Authority v. Balbir Singh',
        citation: '(2004) 5 SCC 65',
        court: 'Supreme Court of India',
        year: 2004,
        outcome: 'plaintiff_won',
        filingFee: 200,
        keyHolding:
          'Compensation for harassment and mental agony may be awarded in consumer cases.',
      },
    ],
    successProbability: 81,
    landmines: [],
    clarifyingQuestions: [],
  };

  await prisma.dispute.create({
    data: {
      userId: user.id,
      status: 'complete',
      originalInput: 'SEED_EMPLOYMENT_MEENA',
      originalLanguage: 'hi',
      disputeRecord: JSON.stringify(employmentRecord),
      legalNotice: employmentNotice,
      forumComplaint: employmentComplaint,
      evidenceChecklist: employmentChecklist,
      coachingSummary: employmentCoachingHindi,
      revisedNotice: employmentRevisedNotice,
      revisedComplaint: employmentRevisedComplaint,
      adversarialCritique: JSON.stringify(employmentCritique),
      revisionCount: 1,
      successProbability: 74,
    },
  });

  await prisma.dispute.create({
    data: {
      userId: user.id,
      status: 'complete',
      originalInput: 'SEED_CONSUMER_ARJUN',
      originalLanguage: 'en',
      disputeRecord: JSON.stringify(consumerRecord),
      legalNotice: consumerNotice,
      forumComplaint: consumerComplaint,
      evidenceChecklist: consumerChecklist,
      coachingSummary: consumerCoachingEnglish,
      revisedNotice: consumerRevisedNotice,
      revisedComplaint: consumerRevisedComplaint,
      adversarialCritique: JSON.stringify(consumerCritique),
      revisionCount: 1,
      successProbability: 81,
    },
  });

  console.log('Seed complete: 2 disputes + demo user created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
