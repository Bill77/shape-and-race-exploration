import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const heatId = parseInt(params.id, 10);

    const results = await db
      .select()
      .from(schema.heatResults)
      .where(eq(schema.heatResults.heatId, heatId))
      .orderBy(schema.heatResults.place);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching heat results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heat results' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const heatId = parseInt(params.id, 10);
    const body = await request.json();

    // Body should be an array of results, one for each place (1-4)
    if (!Array.isArray(body) || body.length !== 4) {
      return NextResponse.json(
        { error: 'Expected array of 4 results (one per place)' },
        { status: 400 }
      );
    }

    // Validate places are 1-4
    const places = body.map((r) => parseInt(r.place, 10)).sort();
    if (places.some((p, i) => p !== i + 1)) {
      return NextResponse.json(
        { error: 'Places must be 1, 2, 3, and 4' },
        { status: 400 }
      );
    }

    // Delete existing results for this heat
    await db
      .delete(schema.heatResults)
      .where(eq(schema.heatResults.heatId, heatId));

    // Insert new results
    const newResults = await db
      .insert(schema.heatResults)
      .values(
        body.map((result) => ({
          heatId,
          place: parseInt(result.place, 10),
          carId: parseInt(result.carId, 10),
          lane: result.lane ? parseInt(result.lane, 10) : null,
          timeMs: result.timeMs ? parseInt(result.timeMs, 10) : null,
        }))
      )
      .returning();

    return NextResponse.json(newResults, { status: 201 });
  } catch (error) {
    console.error('Error creating heat results:', error);
    return NextResponse.json(
      { error: 'Failed to create heat results' },
      { status: 500 }
    );
  }
}
