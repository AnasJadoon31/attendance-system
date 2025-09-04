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
    <div>
      <h1 className="text-2xl font-bold mb-4">Rosters</h1>
      <form action={createRoster} className="mb-4 flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="New roster name"
          className="border p-2 flex-grow"
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
      </form>
      <ul className="space-y-2">
        {rosters.map((r) => (
          <li
            key={r.id}
            className="p-2 bg-white rounded shadow flex items-center justify-between"
          >
            <Link href={`/rosters/${r.id}`} className="flex-grow">
              {r.name}
            </Link>
            <form action={deleteRoster}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="ml-4 text-red-600 hover:text-red-800"
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
