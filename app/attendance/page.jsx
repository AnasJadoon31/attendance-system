import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function NewAttendancePage() {
  const rosters = await prisma.roster.findMany({ orderBy: { name: 'asc' } });
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

  async function createSession(formData) {
    'use server';
    const subject = formData.get('subject');
    const date = formData.get('date');
    const rosterId = Number(formData.get('rosterId'));
    if (!subject || !date || !rosterId) return;
    const session = await prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({ where: { rosterId } });
      const s = await tx.attendanceSession.create({
        data: { subject, sessionDate: new Date(date), rosterId },
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
    redirect(`/attendance/${session.id}`);
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Take Attendance
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
          Create New Attendance Session
        </h2>

        <form action={createSession} className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">Subject</label>
            <input
              name="subject"
              placeholder="Enter subject name (e.g., Computer Science, Mathematics)"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={today}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Select Roster</label>
            <select
              name="rosterId"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
              required
            >
              <option value="">Choose a class roster</option>
              {rosters.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-700 text-white">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
            🚀 Create Session & Start Taking Attendance
          </button>
        </form>
      </div>
    </div>
  );
}
