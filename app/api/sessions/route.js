import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  subject: z.string().min(1),
  rosterId: z.coerce.number(),
  sessionDate: z.coerce.date(),
});

export async function GET() {
  const sessions = await prisma.attendanceSession.findMany({
    include: { roster: true, records: true },
    orderBy: { sessionDate: 'desc' },
  });
  const formatted = sessions.map((s) => ({
    id: s.id,
    subject: s.subject,
    sessionDate: s.sessionDate,
    rosterName: s.roster.name,
    present: s.records.filter((r) => r.status === 'PRESENT').length,
    absent: s.records.filter((r) => r.status === 'ABSENT').length,
    locked: s.locked,
  }));
  return Response.json({ ok: true, sessions: formatted });
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { subject, rosterId, sessionDate } = createSchema.parse(data);
    const students = await prisma.student.findMany({ where: { rosterId } });
    const session = await prisma.$transaction(async (tx) => {
      const s = await tx.attendanceSession.create({
        data: { subject, rosterId, sessionDate },
      });
      if (students.length) {
        await tx.attendanceRecord.createMany({
          data: students.map((st) => ({
            sessionId: s.id,
            studentId: st.id,
            status: 'PRESENT',
          })),
        });
      }
      return s;
    });
    return Response.json({ ok: true, session });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 400 });
  }
}
