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
    total: s.records.length,
  }));

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Attendance History
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
              Quick Actions
            </h2>
            <p className="text-slate-300">Manage attendance sessions and view historical data</p>
          </div>
          <Link
            href="/attendance"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            📝 Take New Attendance
          </Link>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
            Attendance Sessions ({rows.length})
          </h2>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-slate-400">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-lg font-medium">No attendance sessions found</p>
              <p className="text-sm mb-4">Start by creating your first attendance session</p>
              <Link
                href="/attendance"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📝 Create First Session
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/30">
                  <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Roster
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-cyan-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {rows.map((session, index) => {
                  const attendancePercentage = session.total > 0 ? Math.round((session.present / session.total) * 100) : 0;

                  return (
                    <tr key={session.id} className="group hover:bg-slate-700/20 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                weekday: 'long'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/attendance/${session.id}`}
                          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300"
                        >
                          {session.subject}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {session.rosterName}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                              <span className="text-emerald-400 font-medium">{session.present}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                              <span className="text-red-400 font-medium">{session.absent}</span>
                            </div>
                          </div>
                          <div className="text-slate-400 text-sm">
                            {attendancePercentage}% present
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          session.locked 
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {session.locked ? (
                            <>
                              <span className="mr-1">🔒</span>
                              Locked
                            </>
                          ) : (
                            <>
                              <span className="mr-1">🔓</span>
                              Active
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/attendance/${session.id}`}
                            className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm font-medium"
                          >
                            View
                          </Link>
                          <a
                            href={`/api/sessions/${session.id}/export`}
                            className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/30 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm font-medium"
                          >
                            Export
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {rows.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Sessions</p>
                <p className="text-white text-2xl font-bold">{rows.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">✅</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Active Sessions</p>
                <p className="text-white text-2xl font-bold">{rows.filter(r => !r.locked).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">🔒</span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Locked Sessions</p>
                <p className="text-white text-2xl font-bold">{rows.filter(r => r.locked).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
