import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function RostersPage() {
  const rosters = await prisma.roster.findMany({ orderBy: { id: 'desc' } });

  async function createRoster(formData) {
    'use server';
    const name = formData.get('name');
    if (!name) return;
    await prisma.roster.create({ data: { name } });
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
          <li key={r.id} className="p-2 bg-white rounded shadow">
            <Link href={`/rosters/${r.id}`}>{r.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
