import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb/connect';
import Favorite from '@/lib/mongodb/models/favorite';
import { authOptions } from '../auth/[...nextauth]/route';
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
  coordinates: {
    lat: number;
    lng: number;
  };
}

const rateLimit = new Map<string, number[]>();
const RATE_LIMIT = 100; 
const RATE_LIMIT_WINDOW = 60 * 1000; 

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimit.get(userId) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimit.set(userId, recentRequests);
  return false;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isRateLimited(session.user.id)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    await connectDB();
    
    // Use lean() to get plain objects instead of mongoose documents
    const favorites = await Favorite.find({ 
      userId: session.user.id 
    }).sort({ createdAt: -1 }).lean();
    
    console.log('Raw favorites from database:', {
      count: favorites.length,
      firstFavorite: favorites[0] ? {
        id: favorites[0]._id,
        name: favorites[0].placeName,
        location: favorites[0].placeLocation,
        rating: favorites[0].rating,
        bestTimeToVisit: favorites[0].bestTimeToVisit,
        duration: favorites[0].duration,
        distance: favorites[0].distance,
        temperature: favorites[0].temperature,
        crowdLevel: favorites[0].crowdLevel,
        bestRoutes: favorites[0].bestRoutes,
        coordinates: favorites[0].coordinates
      } : 'No favorites'
    });
    
    // Make sure all required fields are present in the response
    const sanitizedFavorites = favorites.map(favorite => {
      // Convert _id to string to ensure consistent format
      const _id = (favorite as { _id: { toString(): string } })._id.toString();
      
      const result = {
        _id,
        placeId: favorite.placeId || '',
        placeName: favorite.placeName || 'Unknown Place',
        placeDescription: favorite.placeDescription || 'No description available',
        placeLocation: favorite.placeLocation || 'Unknown Location',
        placeImage: (favorite.placeImage && favorite.placeImage !== 'undefined') 
          ? favorite.placeImage 
          : '/placeholder.jpg',
        coordinates: favorite.coordinates || { lat: 0, lng: 0 },
        createdAt: favorite.createdAt,
        rating: favorite.rating || 0,
        bestTimeToVisit: favorite.bestTimeToVisit || 'Anytime',
        duration: favorite.duration || '1-2 hours',
        distance: favorite.distance || 'Unknown',
        priceLevel: favorite.priceLevel || 1,
        categories: favorite.categories || [],
        goodFor: favorite.goodFor || [],
        temperature: favorite.temperature || 'Moderate',
        crowdLevel: favorite.crowdLevel || 'Moderate',
        bestRoutes: favorite.bestRoutes || []
      };
      
      console.log('Sanitized favorite data:', _id, result.placeName, result.placeLocation);
      return result;
    });
    
    return NextResponse.json(sanitizedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isRateLimited(session.user.id)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { 
      placeId, 
      placeName, 
      placeDescription, 
      placeLocation, 
      placeImage, 
      rating, 
      categories, 
      bestTimeToVisit, 
      duration, 
      goodFor, 
      distance, 
      priceLevel, 
      temperature, 
      weatherForecast, 
      crowdLevel, 
      bestRoutes,
      coordinates
    } = body;
    
    // Ensure coordinates are properly handled
    const sanitizedCoordinates = coordinates ? {
      lat: coordinates.lat || 0,
      lng: coordinates.lng || 0
    } : {
      lat: 0,
      lng: 0
    };
    
    // Log the exact data received
    console.log('API received favorite data:', {
      placeId,
      placeName,
      location: placeLocation,
      description: placeDescription?.substring(0, 30) + '...',
      image: placeImage?.substring(0, 30) + '...',
      rating,
      bestTimeToVisit,
      duration,
      distance,
      temperature,
      weatherForecast,
      crowdLevel,
      categories: categories?.length,
      goodFor: goodFor?.length,
      bestRoutes: bestRoutes?.length,
      coordinates: sanitizedCoordinates
    });
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' }, 
        { status: 400 }
      );
    }

    await connectDB();

    // Find existing favorite
    const existing = await Favorite.findOne({
      userId: session.user.id,
      placeId,
    }).lean() as { _id: { toString(): string } } | null;

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return NextResponse.json({ 
        favorited: false,
        message: 'Removed from favorites'
      });
    }

    // Use the actual data received from the client
    const favoriteData = {
      userId: session.user.id,
      placeId,
      placeName,
      placeDescription,
      placeLocation,
      placeImage,
      coordinates: sanitizedCoordinates,
      rating,
      categories,
      bestTimeToVisit,
      duration,
      goodFor,
      distance,
      priceLevel,
      temperature,
      weatherForecast,
      crowdLevel,
      bestRoutes
    };
    
    // Save the favorite
    const favorite = await Favorite.create(favoriteData);
    
    // Get the created document as a plain object
    const savedFavorite = await Favorite.findById(favorite._id).lean();
    
    console.log('Created favorite with data:', {
      id: favorite._id,
      name: placeName,
      location: placeLocation,
      savedData: savedFavorite
    });

    return NextResponse.json({ 
      favorited: true, 
      message: 'Added to favorites',
      favorite: {
        _id: favorite._id.toString(),
        ...favoriteData
      } 
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}