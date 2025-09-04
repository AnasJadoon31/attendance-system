import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(1),
  enrollmentNumber: z.string().min(1),
  extra: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export async function GET(req, { params }) {
  const rosterId = Number(params.id);
  const students = await prisma.student.findMany({
    where: { rosterId },
    orderBy: { id: 'asc' },
  });
  return Response.json({ ok: true, students });
}

export async function POST(req, { params }) {
  const rosterId = Number(params.id);
  try {
    const data = await req.json();
    const students = z.array(studentSchema).parse(data.students);
    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const s of students) {
        const { enrollmentNumber, name, extra, notes } = s;
        const student = await tx.student.upsert({
          where: { rosterId_enrollmentNumber: { rosterId, enrollmentNumber } },
          update: { name, extra, notes },
          create: { rosterId, name, enrollmentNumber, extra, notes },
        });
        results.push(student);
      }
      return results;
    });
    return Response.json({ ok: true, students: created });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 400 });
  }
}
