import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { counter } from '@/db/schema';

export async function POST() {
  const [row] = await db
    .insert(counter)
    .values({ id: 1, value: 1 })
    .onConflictDoUpdate({ target: counter.id, set: { value: sql`${counter.value} + 1` } })
    .returning();
  return NextResponse.json({ value: row.value });
}
