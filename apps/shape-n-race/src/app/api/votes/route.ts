import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const criterionId = searchParams.get('criterionId');

    let votes;
    
    if (sessionId && criterionId) {
      const criterionIdNum = parseInt(criterionId, 10);
      votes = await db
        .select()
        .from(schema.votes)
        .where(
          and(
            eq(schema.votes.sessionId, sessionId),
            eq(schema.votes.criterionId, criterionIdNum)
          )
        );
    } else if (sessionId) {
      votes = await db
        .select()
        .from(schema.votes)
        .where(eq(schema.votes.sessionId, sessionId));
    } else if (criterionId) {
      const criterionIdNum = parseInt(criterionId, 10);
      votes = await db
        .select()
        .from(schema.votes)
        .where(eq(schema.votes.criterionId, criterionIdNum));
    } else {
      votes = await db.select().from(schema.votes);
    }

    return NextResponse.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, criterionId, sessionId } = body;

    if (!carId || !criterionId) {
      return NextResponse.json(
        { error: 'carId and criterionId are required' },
        { status: 400 }
      );
    }

    // Optional: Check if user already voted for this criterion (if sessionId provided)
    if (sessionId) {
      const existingVote = await db
        .select()
        .from(schema.votes)
        .where(
          and(
            eq(schema.votes.sessionId, sessionId),
            eq(schema.votes.criterionId, parseInt(criterionId, 10))
          )
        )
        .limit(1);

      if (existingVote.length > 0) {
        // Update existing vote instead of creating duplicate
        const updated = await db
          .update(schema.votes)
          .set({ carId: parseInt(carId, 10) })
          .where(eq(schema.votes.id, existingVote[0].id))
          .returning();

        return NextResponse.json(updated[0]);
      }
    }

    const newVote = await db
      .insert(schema.votes)
      .values({
        carId: parseInt(carId, 10),
        criterionId: parseInt(criterionId, 10),
        sessionId: sessionId || null,
      })
      .returning();

    return NextResponse.json(newVote[0], { status: 201 });
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: 'Failed to create vote' },
      { status: 500 }
    );
  }
}
