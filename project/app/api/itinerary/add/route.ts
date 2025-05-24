import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { getAllTransportationOptions } from '@/lib/openroute';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { placeId, placeName, placeDescription, placeLocation, placeImage, coordinates, date } = await req.json();

    if (!placeId || !placeName || !placeLocation || !coordinates || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Ensure the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Please select a date in the future' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if the place is already in the itinerary for this date
    const existingItinerary = await db.collection('itinerary').findOne({
      userId: session.user.id,
      placeId: placeId,
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingItinerary) {
      return NextResponse.json(
        { error: 'Place already in itinerary for this date' },
        { status: 400 }
      );
    }

    // Get transportation modes
    const transportationModes = await getAllTransportationOptions(
      { lat: coordinates.lat, lng: coordinates.lng },
      { lat: coordinates.lat, lng: coordinates.lng } // Using same coordinates for now
    );

    // Add to itinerary with coordinates and transportation modes
    const result = await db.collection('itinerary').insertOne({
      userId: session.user.id,
      placeId,
      placeName,
      placeDescription,
      placeLocation,
      placeImage,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      transportationModes,
      date: selectedDate,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error adding to itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to add to itinerary' },
      { status: 500 }
    );
  }
} 