import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import ImportForm from './ImportForm.jsx';

export const runtime = 'nodejs';

export default async function RosterPage({ params }) {
  const rosterId = Number(params.id);
  const roster = await prisma.roster.findUnique({
    where: { id: rosterId },
    include: { students: true },
  });
  if (!roster) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Roster not found</div>
    </div>
  );

  // Sort students by enrollment number
  const sortedStudents = [...roster.students].sort((a, b) => {
    return a.enrollmentNumber.localeCompare(b.enrollmentNumber, undefined, { numeric: true });
  });

  const extraKeys = Array.from(
    new Set(
      roster.students.flatMap((s) => (s.extra ? Object.keys(s.extra) : []))
    )
  );

  async function addStudent(formData) {
    'use server';
    const enrollmentNumber = formData.get('enrollmentNumber');
    const name = formData.get('name');
    if (!enrollmentNumber || !name) return;
    await prisma.student.upsert({
      where: {
        rosterId_enrollmentNumber: {
          rosterId,
          enrollmentNumber: String(enrollmentNumber),
        },
      },
      update: { name: String(name) },
      create: {
        rosterId,
        enrollmentNumber: String(enrollmentNumber),
        name: String(name),
      },
    });
    revalidatePath(`/rosters/${rosterId}`);
  }

  async function deleteStudent(formData) {
    'use server';
    const id = Number(formData.get('id'));
    if (!id) return;
    await prisma.student.delete({ where: { id } });
    revalidatePath(`/rosters/${rosterId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {roster.name}
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
        </div>

        {/* Add Student Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            Add New Student
          </h2>
          <form action={addStudent} className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                name="enrollmentNumber"
                placeholder="Enrollment Number"
                className="w-full sm:w-48 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            <div className="relative flex-grow">
              <input
                type="text"
                name="name"
                placeholder="Student Name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Add Student
            </button>
          </form>
        </div>

        {/* Import Form */}
        <ImportForm rosterId={rosterId} />

        {/* Students Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              Students ({sortedStudents.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/30">
                  <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Enrollment
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Name
                  </th>
                  {extraKeys.map((k) => (
                    <th key={k} className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                      {k}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {sortedStudents.map((s, index) => (
                  <tr key={s.id} className="group hover:bg-slate-700/20 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <span className="text-white font-mono">{s.enrollmentNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      {s.name}
                    </td>
                    {extraKeys.map((k) => (
                      <td key={k} className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {s.extra?.[k] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <form action={deleteStudent}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm font-medium">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {sortedStudents.length === 0 && (
                  <tr>
                    <td colSpan={3 + extraKeys.length} className="px-6 py-12 text-center">
                      <div className="text-slate-400">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">👥</span>
                        </div>
                        <p className="text-lg font-medium">No students found</p>
                        <p className="text-sm">Add students manually or import from a file</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
