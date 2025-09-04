import Link from 'next/link';

export default function HomePage() {
  const cards = [
    { href: '/attendance', title: 'Take Attendance' },
    { href: '/sessions', title: 'Attendance History' },
    { href: '/rosters', title: 'Manage Lists / Add Students' },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3 mt-10">
      {cards.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="flex items-center justify-center h-40 rounded-lg bg-white shadow hover:bg-gray-100"
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}
