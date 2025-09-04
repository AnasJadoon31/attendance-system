import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

export default async function RosterPage({ params }) {
  const rosterId = Number(params.id);
  const roster = await prisma.roster.findUnique({
    where: { id: rosterId },
    include: { students: true },
  });
  if (!roster) return <div>Roster not found</div>;

  const extraKeys = Array.from(
    new Set(
      roster.students.flatMap((s) => (s.extra ? Object.keys(s.extra) : []))
    )
  );

  async function importAction(formData) {
    'use server';
    const file = formData.get('file');
    if (!file || typeof file === 'string') return;
    const buf = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buf, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const students = rows
      .map((row) => {
        const get = (...keys) => {
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== '') return row[k];
          }
        };
        const enrollmentNumber = get(
          'enrollmentNumber',
          'EnrollmentNumber',
          'enrollmentnumber'
        );
        const name = get('name', 'Name');
        const first = get('firstName', 'First Name', 'firstname');
        const last = get('lastName', 'Last Name', 'lastname');
        const fullName = name || [first, last].filter(Boolean).join(' ');
        const extra = { ...row };
        delete extra.enrollmentNumber;
        delete extra.EnrollmentNumber;
        delete extra.enrollmentnumber;
        delete extra.name;
        delete extra.Name;
        delete extra.firstName;
        delete extra['First Name'];
        delete extra.firstname;
        delete extra.lastName;
        delete extra['Last Name'];
        delete extra.lastname;
        return {
          enrollmentNumber: String(enrollmentNumber || ''),
          name: String(fullName || ''),
          extra,
        };
      })
      .filter((s) => s.enrollmentNumber && s.name);
    const unique = Object.values(
      students.reduce((acc, s) => {
        acc[s.enrollmentNumber] = s;
        return acc;
      }, {})
    );
    await prisma.$transaction(async (tx) => {
      for (const s of unique) {
        await tx.student.upsert({
          where: {
            rosterId_enrollmentNumber: { rosterId, enrollmentNumber: s.enrollmentNumber },
          },
          update: { name: s.name, extra: s.extra },
          create: {
            rosterId,
            name: s.name,
            enrollmentNumber: s.enrollmentNumber,
            extra: s.extra,
          },
        });
      }
    });
    revalidatePath(`/rosters/${rosterId}`);
  }

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{roster.name}</h1>
      <form action={addStudent} className="mb-4 flex gap-2">
        <input
          type="text"
          name="enrollmentNumber"
          placeholder="Enrollment #"
          className="border p-2"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Student name"
          className="border p-2 flex-grow"
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Student
        </button>
      </form>

      <form
        action={importAction}
        className="mb-4 flex gap-2"
        encType="multipart/form-data"
      >
        <input
          type="file"
          name="file"
          accept=".xlsx,.csv"
          className="flex-grow"
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Import</button>
        <a
          href={`/api/rosters/${rosterId}/export`}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Export CSV
        </a>
      </form>
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2 text-left">Enrollment</th>
              <th className="p-2 text-left">Name</th>
              {extraKeys.map((k) => (
                <th key={k} className="p-2 text-left">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.enrollmentNumber}</td>
                <td className="p-2">{s.name}</td>
                {extraKeys.map((k) => (
                  <td key={k} className="p-2">{s.extra?.[k] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
