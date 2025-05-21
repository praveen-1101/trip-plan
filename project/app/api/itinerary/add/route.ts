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

    const { placeId, placeName, placeDescription, placeLocation, placeImage, coordinates, day } = await req.json();

    if (!placeId || !placeName || !placeLocation || !coordinates || !day) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if the place is already in the itinerary for this day
    const existingItinerary = await db.collection('itinerary').findOne({
      userId: session.user.id,
      placeId: placeId,
      day: day
    });

    if (existingItinerary) {
      return NextResponse.json(
        { error: 'Place already in itinerary for this day' },
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
      day,
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