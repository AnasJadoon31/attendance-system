import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  const rosters = await prisma.roster.findMany({ orderBy: { id: 'desc' } });
  return Response.json({ ok: true, rosters });
}

const rosterSchema = z.object({ name: z.string().min(1) });

export async function POST(req) {
  try {
    const data = await req.json();
    const { name } = rosterSchema.parse(data);
    const roster = await prisma.roster.create({ data: { name } });
    return Response.json({ ok: true, roster });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 400 });
  }
}
