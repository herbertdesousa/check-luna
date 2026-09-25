import { NextResponse } from 'next/server';
import { db } from '@/db';
import { counter } from '@/db/schema';

export async function GET() {
  const [row] = await db.select().from(counter).limit(1);
  return NextResponse.json({ value: row?.value ?? 0 });
}
