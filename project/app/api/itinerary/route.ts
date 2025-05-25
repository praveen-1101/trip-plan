import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb/connect';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextRequest } from 'next/server';
import Itinerary from '@/lib/mongodb/models/itinerary';
import { TransportMode } from '@/types/transportation';

interface ItineraryDocument {
  userId: string;
  placeId: string;
  placeName: string;
  placeDescription: string;
  placeLocation: string;
  placeImage: string;
  date: Date;
  rating: number;
  categories: string[];
  bestTimeToVisit: string;
  duration: string;
  goodFor: string[];
  distance: string;
  priceLevel: number;
  temperature: string;
  weatherForecast: string;
  crowdLevel: string;
  bestRoutes: string[];
  coordinates: { lat: number; lng: number };
  transportationModes?: {
    [key in TransportMode]?: {
      distance?: number;
      duration?: number;
    };
  };
}
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      placeId, 
      placeName, 
      placeDescription, 
      placeLocation, 
      placeImage, 
      date, 
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
      coordinates,
      transportOptions
    } = await request.json();
    
    // Log the exact data received
    console.log('API received itinerary data:', {
      placeId,
      placeName,
      location: placeLocation,
      description: placeDescription?.substring(0, 20) + '...',
      image: placeImage?.substring(0, 30) + '...',
      date,
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
      coordinates,
      transportOptions
    });

    const transportationModesForDB: ItineraryDocument['transportationModes'] = {};
    if (Array.isArray(transportOptions)) {
      transportOptions.forEach((option: any) => { // Use 'any' or define a 'TransportationOption' interface for the frontend payload
        if (option.mode && typeof option.distance === 'number' && typeof option.duration === 'number') {
          transportationModesForDB[option.mode as TransportMode] = { // Type assertion to ensure correct key type
            distance: option.distance,
            duration: option.duration
          };
        }
      });
    }

    console.log('API received itinerary data: ', {
      transportationModes: transportationModesForDB
    });
    
    if (!placeId || !date) {
      return NextResponse.json(
        { error: 'Place ID and date are required' }, 
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

    // Set time to start of day for comparison
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    await connectDB();

    // Check if the exact same place is already added on the same date
    const existing = await Itinerary.findOne({
      userId: session.user.id,
      placeId,
      date: {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      }
    }).lean() as { userId: string } | null;

    if (existing) {
      return NextResponse.json(
        { error: 'This place is already in your itinerary for this date' },
        { status: 400 }
      );
    }

    // Ensure data integrity for all fields before saving
    const sanitizedName = placeName || 'Unknown Place';
    const sanitizedDescription = placeDescription || 'No description available';
    const sanitizedLocation = placeLocation || 'Unknown Location';
    const sanitizedImage = placeImage && typeof placeImage === 'string' && placeImage !== 'undefined' 
      ? placeImage 
      : '/placeholder.jpg';
    const sanitizedRating = typeof rating === 'number' ? rating : 0;  
    const sanitizedCategories = Array.isArray(categories) ? categories : [];
    const sanitizedBestTimeToVisit = bestTimeToVisit || 'Anytime';
    const sanitizedDuration = duration || '1-2 hours';
    const sanitizedGoodFor = Array.isArray(goodFor) ? goodFor : [];
    const sanitizedDistance = distance || 'Unknown';
    const sanitizedPriceLevel = typeof priceLevel === 'number' ? priceLevel : 1;
    const sanitizedTemperature = temperature || 'Moderate';
    const sanitizedWeatherForecast = weatherForecast || 'Varies';
    const sanitizedCrowdLevel = crowdLevel || 'Moderate';
    const sanitizedBestRoutes = Array.isArray(bestRoutes) ? bestRoutes : [];
    const sanitizedCoordinates = coordinates ? {
      lat: coordinates.lat || 0,
      lng: coordinates.lng || 0
    } : {
      lat: 0,
      lng: 0
    };
    const sanitizedTransportationModes = transportationModesForDB;

    // Ensure all fields are properly populated
    const itineraryItem = await Itinerary.create({
      userId: session.user.id,
      placeId,
      placeName: sanitizedName,
      placeDescription: sanitizedDescription,
      placeLocation: sanitizedLocation,
      placeImage: sanitizedImage,
      coordinates: sanitizedCoordinates,
      date: selectedDate,
      rating: sanitizedRating,
      categories: sanitizedCategories,
      bestTimeToVisit: sanitizedBestTimeToVisit,
      duration: sanitizedDuration,
      goodFor: sanitizedGoodFor,
      distance: sanitizedDistance,
      priceLevel: sanitizedPriceLevel,
      temperature: sanitizedTemperature,
      weatherForecast: sanitizedWeatherForecast,
      crowdLevel: sanitizedCrowdLevel,
      bestRoutes: sanitizedBestRoutes,
      transportationModes: sanitizedTransportationModes
    });

    console.log('Created itinerary item with data:', {
      id: itineraryItem._id,
      name: sanitizedName,
      location: sanitizedLocation,
      date: selectedDate.toLocaleDateString(),
      rating: sanitizedRating,
      categories: sanitizedCategories,
      bestTimeToVisit: sanitizedBestTimeToVisit,
      duration: sanitizedDuration,
      goodFor: sanitizedGoodFor,
      distance: sanitizedDistance,
      priceLevel: sanitizedPriceLevel,
      temperature: sanitizedTemperature,
      weatherForecast: sanitizedWeatherForecast,
      crowdLevel: sanitizedCrowdLevel,
      bestRoutes: sanitizedBestRoutes,
      coordinates: sanitizedCoordinates,
      transportationModes: sanitizedTransportationModes
    });

    return NextResponse.json({ 
      success: true,
      itineraryItem 
    });
  } catch (error) {
    console.error('Error adding to itinerary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add to itinerary',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const itinerary = await Itinerary.find({ userId: session.user.id })
      .sort({ date: 1 });
    
    console.log('Fetched itinerary from database:', itinerary.length);
    
    // Ensure all itinerary items have complete data
    const sanitizedItinerary = itinerary.map(item => {
      const result = {
        _id: item._id,
        placeId: item.placeId,
        placeName: item.placeName || 'Unknown Place',
        placeDescription: item.placeDescription || 'No description available',
        placeLocation: item.placeLocation || 'Unknown Location',
        placeImage: item.placeImage || '/placeholder.jpg',
        coordinates: {
          lat: item.coordinates?.lat || 0,
          lng: item.coordinates?.lng || 0
        },
        date: item.date,
        createdAt: item.createdAt,
        rating: item.rating || 0,
        categories: item.categories || [],
        bestTimeToVisit: item.bestTimeToVisit || 'Anytime',
        duration: item.duration || '1-2 hours',
        goodFor: item.goodFor || [],
        distance: item.distance  || 'Unknown',
        priceLevel: item.priceLevel || 1,  
        temperature: item.temperature || 'Moderate',
        weatherForecast: item.weatherForecast || 'Varies',
        crowdLevel: item.crowdLevel || 'Moderate',
        bestRoutes: item.bestRoutes || [],
        transportationData: item.transportationModes || {}
      };
      
      console.log('Sanitized itinerary data:', result.placeName, new Date(result.date).toLocaleDateString());
      return result;
    });
    
    return NextResponse.json(sanitizedItinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
