import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(req, { params }) {
  const rosterId = Number(params.id);
  const students = await prisma.student.findMany({ where: { rosterId } });
  const rows = students.map((s) => ({
    enrollmentNumber: s.enrollmentNumber,
    name: s.name,
    ...(s.extra || {}),
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return new Response('\ufeff' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="roster.csv"',
    },
  });
}
