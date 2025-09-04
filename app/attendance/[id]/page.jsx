import { prisma } from '@/lib/prisma';
import AttendanceTable from '@/components/AttendanceTable';

export default async function AttendanceSessionPage({ params }) {
  const sessionId = Number(params.id);
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      roster: true,
      records: { include: { student: true } },
    },
  });
  if (!session) return <div>Session not found</div>;

  const records = session.records.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    name: r.student.name,
    enrollmentNumber: r.student.enrollmentNumber,
    extra: r.student.extra,
    status: r.status,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{session.subject}</h1>
      <p className="mb-4">
        {session.sessionDate.toISOString().slice(0, 10)} – {session.roster.name}
      </p>
      <AttendanceTable sessionId={session.id} locked={session.locked} records={records} />
    </div>
  );
}
