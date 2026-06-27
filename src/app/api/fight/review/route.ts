import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runAgent4 } from '@/agents/agent4-adversarial';
import { reviseDocuments } from '@/agents/agent3-drafter';
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
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

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

        if (dispute.revisionCount >= 2) {
          send('max_revisions', 'Maximum revisions reached');
          send('done', '');
          return;
        }

        const record = JSON.parse(dispute.disputeRecord) as DisputeRecord;
        const notice = dispute.legalNotice ?? '';
        const complaint = dispute.forumComplaint ?? '';

        // Run verification first — feed results to adversarial agent
        const preVerification = verifyDocuments(record, notice, complaint);
        send('verification_pre', JSON.stringify(preVerification));

        send('phase', 'critiquing');
        const critique = await runAgent4(notice, complaint);
        send('critique', JSON.stringify(critique));

        send('phase', 'rewriting');
        const { revisedNotice, revisedComplaint } = await reviseDocuments(
          record,
          notice,
          complaint,
          critique
        );
        send('revised_notice', revisedNotice);
        send('revised_complaint', revisedComplaint);

        // Verify revised documents
        const postVerification = verifyDocuments(record, revisedNotice, revisedComplaint);
        send('verification_post', JSON.stringify(postVerification));

        await prisma.dispute.update({
          where: { id: disputeId },
          data: {
            status: 'reviewed',
            revisedNotice,
            revisedComplaint,
            adversarialCritique: JSON.stringify(critique),
            revisionCount: { increment: 1 },
          },
        });

        send('phase', 'finalized');
        send('done', '');
      } catch (error) {
        send('error', String(error));
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
