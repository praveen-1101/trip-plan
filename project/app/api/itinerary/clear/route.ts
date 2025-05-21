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

    await connectDB();

    // Delete all itinerary items for the current user
    const result = await Itinerary.deleteMany({ userId: session.user.id });
    
    console.log('Cleared all itinerary items for user:', session.user.id, 'Count:', result.deletedCount);

    return NextResponse.json({ success: true, count: result.deletedCount });
  } catch (error) {
    console.error('Error clearing itinerary:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 