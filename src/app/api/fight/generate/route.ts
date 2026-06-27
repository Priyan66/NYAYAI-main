import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAllDocuments } from '@/agents/agent3-drafter';
import { verifyDocuments } from '@/lib/verification';
import { DisputeRecord } from '@/types';
import { checkRateLimit } from '@/lib/rate-limiter';

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (!xff) return '127.0.0.1';
  return xff.split(',')[0]?.trim() || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  const { allowed } = checkRateLimit(getIp(req), 6);
  if (!allowed) {
    return new Response('Too many requests', { status: 429 });
  }

  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { disputeId } = (await req.json()) as { disputeId: string };
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (type: string, content: string) => {
        if (closed) return;
        const data = JSON.stringify({ type, content });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const onAbort = () => {
        closed = true;
        try {
          controller.close();
        } catch {
          // ignore
        }
      };

      req.signal.addEventListener('abort', onAbort);

      try {
        const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
        if (!dispute) {
          send('error', 'Dispute not found');
          return;
        }

        const record = JSON.parse(dispute.disputeRecord) as DisputeRecord;

        // Sequential generation — documents build on each other
        send('status', 'Generating documents (this takes 30-60 seconds)...');
        const docs = await generateAllDocuments(record);

        send('notice', docs.legalNotice);
        send('complaint', docs.forumComplaint);
        send('checklist', docs.evidenceChecklist);
        send('coaching', docs.coachingSummary);

        // Run deterministic verification
        send('status', 'Verifying document accuracy...');
        const verification = verifyDocuments(record, docs.legalNotice, docs.forumComplaint);
        send('verification', JSON.stringify(verification));

        await prisma.dispute.update({
          where: { id: disputeId },
          data: {
            status: 'generated',
            legalNotice: docs.legalNotice,
            forumComplaint: docs.forumComplaint,
            evidenceChecklist: docs.evidenceChecklist,
            coachingSummary: docs.coachingSummary,
          },
        });

        send('done', 'Documents generated and verified');
      } catch (error) {
        send('error', `Document generation failed: ${String(error)}`);
      } finally {
        req.signal.removeEventListener('abort', onAbort);
        if (!closed) {
          closed = true;
          controller.close();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
