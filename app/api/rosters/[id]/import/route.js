import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req, { params }) {
  const rosterId = Number(params.id);
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file) throw new Error('File required');
    const buf = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buf, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const students = rows
      .map((row) => {
        const { enrollmentNumber, name, ...extra } = row;
        return {
          enrollmentNumber: String(enrollmentNumber),
          name: String(name),
          extra,
        };
      })
      .filter((s) => s.enrollmentNumber && s.name);
    const unique = Object.values(
      students.reduce((acc, s) => {
        acc[s.enrollmentNumber] = s;
        return acc;
      }, {})
    );
    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const s of unique) {
        const student = await tx.student.upsert({
          where: { rosterId_enrollmentNumber: { rosterId, enrollmentNumber: s.enrollmentNumber } },
          update: { name: s.name, extra: s.extra },
          create: { rosterId, name: s.name, enrollmentNumber: s.enrollmentNumber, extra: s.extra },
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
