import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const criteria = await db
      .select()
      .from(schema.voteCriteria)
      .orderBy(schema.voteCriteria.order);
    
    return NextResponse.json(criteria);
  } catch (error) {
    console.error('Error fetching vote criteria:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote criteria' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, order } = body;

    if (!name || order === undefined) {
      return NextResponse.json(
        { error: 'Name and order are required' },
        { status: 400 }
      );
    }

    const newCriterion = await db
      .insert(schema.voteCriteria)
      .values({
        name,
        order: parseInt(order, 10),
      })
      .returning();

    return NextResponse.json(newCriterion[0], { status: 201 });
  } catch (error) {
    console.error('Error creating vote criterion:', error);
    return NextResponse.json(
      { error: 'Failed to create vote criterion' },
      { status: 500 }
    );
  }
}
