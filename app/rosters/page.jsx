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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Rosters</h1>
      <form action={createRoster} className="flex flex-wrap gap-2">
        <input
          type="text"
          name="name"
          placeholder="New roster name"
          className="border p-2 rounded flex-grow"
          required
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {rosters.map((r) => (
          <li
            key={r.id}
            className="p-4 bg-white rounded shadow flex items-center justify-between"
          >
            <Link
              href={`/rosters/${r.id}`}
              className="flex-grow text-blue-700 hover:underline"
            >
              {r.name}
            </Link>
            <form action={deleteRoster}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="ml-4 text-red-600 hover:underline"
                aria-label="Delete roster"
              >
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
