import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function SessionsPage() {
  const sessions = await prisma.attendanceSession.findMany({
    include: { roster: true, records: true },
    orderBy: { sessionDate: 'desc' },
  });
  const rows = sessions.map((s) => ({
    id: s.id,
    subject: s.subject,
    sessionDate: s.sessionDate,
    rosterName: s.roster.name,
    present: s.records.filter((r) => r.status === 'PRESENT').length,
    absent: s.records.filter((r) => r.status === 'ABSENT').length,
    locked: s.locked,
  }));
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance History</h1>
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-left">Roster</th>
              <th className="p-2 text-right">Present</th>
              <th className="p-2 text-right">Absent</th>
              <th className="p-2 text-center">Locked</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.sessionDate.toISOString().slice(0, 10)}</td>
                <td className="p-2">
                  <Link href={`/attendance/${r.id}`} className="text-blue-600">
                    {r.subject}
                  </Link>
                </td>
                <td className="p-2">{r.rosterName}</td>
                <td className="p-2 text-right">{r.present}</td>
                <td className="p-2 text-right">{r.absent}</td>
                <td className="p-2 text-center">{r.locked ? '🔒' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
