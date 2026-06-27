import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseUploadedFile } from '@/lib/pdf-parser';
import { calculateNyayScore } from '@/lib/nyay-score';
import { UploadedDocument } from '@/types';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const questionnaireRaw = formData.get('questionnaire') as string | null;
    const questionnaire = questionnaireRaw
      ? (JSON.parse(questionnaireRaw) as Record<string, boolean>)
      : undefined;

    if (files.length === 0 && !questionnaire) {
      return NextResponse.json({ error: 'No files uploaded or questionnaire provided' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 files allowed' }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024;

    const uploadedDocuments: UploadedDocument[] = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit` }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const doc = await parseUploadedFile(buffer, file.name, file.type);
      uploadedDocuments.push(doc);
    }

    const scoreResult = await calculateNyayScore(uploadedDocuments, questionnaire);

    const saved = await prisma.nyayScore.create({
      data: {
        userId: session.user.id,
        totalScore: scoreResult.totalScore,
        contractSafety:
          scoreResult.dimensions.find((d) => d.key === 'contractSafety')?.score ?? 50,
        tenancyProtection:
          scoreResult.dimensions.find((d) => d.key === 'tenancyProtection')?.score ?? 50,
        employmentSecurity:
          scoreResult.dimensions.find((d) => d.key === 'employmentSecurity')?.score ?? 50,
        consumerRights:
          scoreResult.dimensions.find((d) => d.key === 'consumerRights')?.score ?? 100,
        digitalRights:
          scoreResult.dimensions.find((d) => d.key === 'digitalRights')?.score ?? 100,
        familyDocumentation:
          scoreResult.dimensions.find((d) => d.key === 'familyDocumentation')?.score ?? 0,
        uploadedDocuments: JSON.stringify(
          uploadedDocuments.map((d) => ({
            name: d.name,
            type: d.type,
            size: d.size,
            parseSuccess: d.parseSuccess,
          }))
        ),
        actionItems: JSON.stringify(scoreResult.actionItems),
      },
    });

    return NextResponse.json({ status: 'success', scoreId: saved.id, score: scoreResult });
  } catch (error) {
    console.error('Score upload error:', error);
    return NextResponse.json(
      { error: 'Score calculation failed. Please try again.' },
      { status: 500 }
    );
  }
}
