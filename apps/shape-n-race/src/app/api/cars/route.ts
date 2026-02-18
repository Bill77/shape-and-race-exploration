import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';

export async function GET() {
  try {
    const allCars = await db.select().from(schema.cars).orderBy(schema.cars.createdAt);
    
    // Parse imageUrls JSON strings
    const cars = allCars.map((car) => {
      let imageUrls: string[];
      try {
        imageUrls = typeof car.imageUrls === 'string' 
          ? JSON.parse(car.imageUrls) 
          : (car.imageUrls as any);
      } catch {
        imageUrls = [];
      }
      return {
        ...car,
        imageUrls,
      };
    });
    
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, imageUrls } = body;

    if (!name || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length !== 3) {
      return NextResponse.json(
        { error: 'Name and exactly 3 imageUrls are required' },
        { status: 400 }
      );
    }

    const newCar = await db
      .insert(schema.cars)
      .values({
        name,
        description: description || null,
        imageUrls: JSON.stringify(imageUrls),
      })
      .returning();

    let parsedImageUrls: string[];
    try {
      parsedImageUrls = typeof newCar[0].imageUrls === 'string'
        ? JSON.parse(newCar[0].imageUrls)
        : (newCar[0].imageUrls as any);
    } catch {
      parsedImageUrls = [];
    }

    const car = {
      ...newCar[0],
      imageUrls: parsedImageUrls,
    };

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    );
  }
}
