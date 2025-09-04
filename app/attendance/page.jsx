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
    <form action={createSession} className="space-y-4">
      <h1 className="text-2xl font-bold">New Attendance</h1>
      <div>
        <label className="block mb-1">Subject</label>
        <input name="subject" className="border p-2 w-full" required />
      </div>
      <div>
        <label className="block mb-1">Date</label>
        <input
          type="date"
          name="date"
          defaultValue={today}
          className="border p-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Roster</label>
        <select name="rosterId" className="border p-2 w-full" required>
          <option value="">Select roster</option>
          {rosters.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}
