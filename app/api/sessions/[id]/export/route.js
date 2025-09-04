import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(req, { params }) {
  const sessionId = Number(params.id);
  const records = await prisma.attendanceRecord.findMany({
    where: { sessionId },
    include: { student: true },
  });
  const rows = records.map((r) => ({
    enrollmentNumber: r.student.enrollmentNumber,
    name: r.student.name,
    status: r.status,
    ...(r.student.extra || {}),
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return new Response('\ufeff' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="session.csv"',
    },
  });
}
