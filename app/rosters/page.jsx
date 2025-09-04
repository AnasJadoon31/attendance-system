import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export default async function RostersPage() {
  const rosters = await prisma.roster.findMany({ orderBy: { id: 'desc' } });

  async function createRoster(formData) {
    'use server';
    const name = formData.get('name');
    if (!name) return;
    await prisma.roster.create({ data: { name } });
    revalidatePath('/rosters');
  }

  async function deleteRoster(formData) {
    'use server';
    const id = Number(formData.get('id'));
    if (!id) return;
    await prisma.roster.delete({ where: { id } });
    revalidatePath('/rosters');
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Class Rosters
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
          Create New Roster
        </h2>
        <form action={createRoster} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="name"
            placeholder="New roster name (e.g., CS-101 Fall 2025)"
            className="flex-grow px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
            required
          />
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Create Roster
          </button>
        </form>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
            Your Rosters ({rosters.length})
          </h2>
        </div>

        {rosters.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-slate-400">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-lg font-medium">No rosters found</p>
              <p className="text-sm">Create your first roster to get started</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {rosters.map((roster, index) => (
              <div
                key={roster.id}
                className="group px-6 py-4 hover:bg-slate-700/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/rosters/${roster.id}`}
                    className="flex items-center flex-grow"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors duration-300">
                        {roster.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Created {new Date(roster.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/rosters/${roster.id}`}
                      className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm font-medium"
                    >
                      Manage
                    </Link>
                    <form action={deleteRoster} className="inline">
                      <input type="hidden" name="id" value={roster.id} />
                      <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm font-medium">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
