import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb/connect';
import Favorite from '@/lib/mongodb/models/favorite';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest } from 'next/server';

// Define interface for the favorite document
interface FavoriteDocument {
  _id: any;
  userId: string;
  placeId: string;
  placeName: string;
  placeDescription?: string;
  placeLocation?: string;
  placeImage?: string;
  createdAt: Date;
  rating?: number;
  bestTimeToVisit?: string;
  duration?: string;
  distance?: string;
  priceLevel?: number;
  categories?: string[];
  goodFor?: string[];
  temperature?: string;
  weatherForecast?: string;
  crowdLevel?: string;
  bestRoutes?: string[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favoriteId = params.id;
    if (!favoriteId) {
      return NextResponse.json(
        { error: 'Favorite ID is required' }, 
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find the favorite and ensure it belongs to the current user
    const favorite = await Favorite.findOne({
      _id: favoriteId,
      userId: session.user.id
    }).lean() as unknown as FavoriteDocument;

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' }, 
        { status: 404 }
      );
    }
    
    // Convert _id to string to ensure consistent format
    const _id = favorite._id.toString();
    
    // Prepare the response with all fields
    const result = {
      _id,
      placeId: favorite.placeId || '',
      placeName: favorite.placeName || 'Unknown Place',
      placeDescription: favorite.placeDescription || 'No description available',
      placeLocation: favorite.placeLocation || 'Unknown Location',
      placeImage: (favorite.placeImage && favorite.placeImage !== 'undefined') 
        ? favorite.placeImage 
        : '/placeholder.jpg',
      createdAt: favorite.createdAt || new Date(),
      // Include additional fields
      rating: favorite.rating || 0,
      bestTimeToVisit: favorite.bestTimeToVisit || 'Anytime',
      duration: favorite.duration || '1-2 hours',
      distance: favorite.distance || 'Unknown',
      priceLevel: favorite.priceLevel || 1,
      categories: favorite.categories || [],
      goodFor: favorite.goodFor || [],
      temperature: favorite.temperature || 'Moderate',
      weatherForecast: favorite.weatherForecast || 'Varies',
      crowdLevel: favorite.crowdLevel || 'Moderate',
      bestRoutes: favorite.bestRoutes || []
    };
    
    console.log('Fetched favorite by ID:', _id, result.placeName);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching favorite by ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 