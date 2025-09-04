import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  records: z.array(
    z.object({ studentId: z.number(), status: z.enum(['PRESENT', 'ABSENT']) })
  ),
  locked: z.boolean().optional(),
});

export async function GET(req, { params }) {
  const sessionId = Number(params.id);
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      roster: true,
      records: { include: { student: true } },
    },
  });
  if (!session)
    return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
  return Response.json({ ok: true, session });
}

export async function POST(req, { params }) {
  const sessionId = Number(params.id);
  try {
    const data = await req.json();
    const { records, locked } = updateSchema.parse(data);
    await prisma.$transaction(async (tx) => {
      for (const r of records) {
        await tx.attendanceRecord.update({
          where: { sessionId_studentId: { sessionId, studentId: r.studentId } },
          data: { status: r.status },
        });
      }
      if (locked !== undefined) {
        await tx.attendanceSession.update({
          where: { id: sessionId },
          data: { locked },
        });
      }
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 400 });
  }
}
