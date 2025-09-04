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
  if (!session) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Session not found</div>
    </div>
  );

  const records = session.records.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    name: r.student.name,
    enrollmentNumber: r.student.enrollmentNumber,
    extra: r.student.extra,
    status: r.status,
  }));

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {session.subject}
          </h1>
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-slate-300">
              📅 {new Date(session.sessionDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-slate-300">•</div>
            <div className="text-slate-300">
              📚 {session.roster.name}
            </div>
            <div className="text-slate-300">•</div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              session.locked 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              {session.locked ? '🔒 Locked' : '🔓 Active'}
            </div>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
        </div>

        {/* Attendance Table Component */}
        <AttendanceTable sessionId={session.id} locked={session.locked} records={records} />

        {/* Back Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/attendance"
            className="inline-flex items-center px-6 py-3 bg-slate-600/50 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-600/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300"
          >
            ← Back to Create New Session
          </a>
        </div>
      </div>
    </div>
  );
}
