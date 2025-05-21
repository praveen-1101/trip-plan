import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb/connect';
import Favorite from '@/lib/mongodb/models/favorite';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { favoriteId } = await request.json();
    
    if (!favoriteId) {
      return NextResponse.json(
        { error: 'Favorite ID is required' }, 
        { status: 400 }
      );
    }

    await connectDB();

    // Make sure the favorite belongs to the user
    const favorite = await Favorite.findOne({
      _id: favoriteId,
      userId: session.user.id
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' }, 
        { status: 404 }
      );
    }

    await Favorite.deleteOne({ _id: favoriteId });
    
    console.log('Removed favorite:', favoriteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 