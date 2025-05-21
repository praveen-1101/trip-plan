import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb/connect';
import Itinerary from '@/lib/mongodb/models/itinerary';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itineraryId } = await request.json();
    
    if (!itineraryId) {
      return NextResponse.json(
        { error: 'Itinerary item ID is required' }, 
        { status: 400 }
      );
    }

    await connectDB();

    // Make sure the itinerary item belongs to the user
    const itineraryItem = await Itinerary.findOne({
      _id: itineraryId,
      userId: session.user.id
    });

    if (!itineraryItem) {
      return NextResponse.json(
        { error: 'Itinerary item not found' }, 
        { status: 404 }
      );
    }

    await Itinerary.deleteOne({ _id: itineraryId });
    
    console.log('Removed itinerary item:', itineraryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing itinerary item:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 