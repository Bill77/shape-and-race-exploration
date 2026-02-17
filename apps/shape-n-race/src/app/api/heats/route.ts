import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const heats = await db
      .select()
      .from(schema.heats)
      .orderBy(schema.heats.order);
    
    return NextResponse.json(heats);
  } catch (error) {
    console.error('Error fetching heats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, label, order } = body;

    if (!name || order === undefined) {
      return NextResponse.json(
        { error: 'Name and order are required' },
        { status: 400 }
      );
    }

    const newHeat = await db
      .insert(schema.heats)
      .values({
        name,
        label: label || null,
        order: parseInt(order, 10),
      })
      .returning();

    return NextResponse.json(newHeat[0], { status: 201 });
  } catch (error) {
    console.error('Error creating heat:', error);
    return NextResponse.json(
      { error: 'Failed to create heat' },
      { status: 500 }
    );
  }
}
