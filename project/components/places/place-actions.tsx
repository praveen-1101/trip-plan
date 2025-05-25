'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Heart, Share2, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import Calendar from 'react-calendar';
import { TransportationOption, TransportMode } from '@/types/transportation'; 

import 'react-calendar/dist/Calendar.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface PlaceActionsProps {
  placeId: string;
  placeName: string;
  placeUrl: string;
  placeDescription?: string;
  placeLocation?: string;
  placeImage?: string;
  rating?: number;
  bestTimeToVisit?: string;
  duration?: string;
  distance?: string;
  priceLevel?: number;
  categories?: string[];
  goodFor?: string[];
  temperature?: number;
  crowdLevel?: string;
  bestRoutes?: string[];
  coordinates?: { lat: number; lng: number };
  transportOptions?: TransportationOption[];
}

export function PlaceActions({ 
  placeId, 
  placeName, 
  placeUrl,
  placeDescription = '',
  placeLocation = '',
  placeImage = '',
  rating = 0,
  bestTimeToVisit = '',
  duration = '',
  distance = '',
  priceLevel = 1,
  categories = [],
  goodFor = [],
  temperature = 0,
  crowdLevel = '',
  bestRoutes = [],
  coordinates = { lat: 0, lng: 0 },
  transportOptions,
}: PlaceActionsProps) {

  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    console.log('PlaceActions component received props:', {
      placeId,
      placeName,
      placeLocation,
      placeDescription: placeDescription?.substring(0, 20) + '...',
      hasImage: !!placeImage,
      imageUrl: placeImage?.substring(0, 30) + '...',
      coordinates,
      transportOptions,
    });
  }, [placeId, placeName, placeLocation, placeDescription, placeImage, temperature, crowdLevel, bestRoutes, categories, goodFor, rating, bestTimeToVisit, duration, distance, priceLevel, transportOptions]);

  // Check initial favorite status
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session) return;
      try {
        const response = await fetch(`/api/favorites/check?placeId=${placeId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.favorited);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    checkFavoriteStatus();
  }, [session, placeId]);

  const handleFavorite = async () => {
    if (!session) {
      toast.error('Please sign in to add places to favorites');
      return;
    }

    setIsFavorited(!isFavorited);
    setIsLoading(true);

    const sanitizedName = placeName || 'Unknown Place';
    const sanitizedDescription = placeDescription || 'No description available';
    const sanitizedLocation = placeLocation || 'Unknown Location';
    const sanitizedImage = placeImage && typeof placeImage === 'string' && placeImage !== 'undefined'   ? placeImage : '/placeholder.jpg';
    const sanitizedRating = typeof rating === 'number' ? rating : 0;
    const sanitizedBestTimeToVisit = bestTimeToVisit || 'Anytime';
    const sanitizedDuration = duration || '1-2 hours';
    const sanitizedDistance = distance || 'Unknown';
    const sanitizedPriceLevel = typeof priceLevel === 'number' ? priceLevel : 1;
    const sanitizedCategories = Array.isArray(categories) ? categories : [];
    const sanitizedGoodFor = Array.isArray(goodFor) ? goodFor : []; 
    const sanitizedTemperature = temperature || 'N/A';
    const sanitizedCrowdLevel = crowdLevel || 'Moderate';
    const sanitizedBestRoutes = Array.isArray(bestRoutes) ? bestRoutes : [];
    const sanitizedCoordinates = coordinates || { lat: 0, lng: 0 };
    const sanitizedTransportOptions = Array.isArray(transportOptions) ? transportOptions : [];

    console.log('Adding to favorites with data:', {
      placeId,
      name: sanitizedName,
      location: sanitizedLocation, 
      description: sanitizedDescription?.substring(0, 20) + '...',
      image: sanitizedImage?.substring(0, 30) + '...',
      rating: sanitizedRating,
      bestTimeToVisit: sanitizedBestTimeToVisit,
      duration: sanitizedDuration,
      categories: sanitizedCategories?.length,
      goodFor: sanitizedGoodFor?.length,
      temperature: sanitizedTemperature,
      crowdLevel: sanitizedCrowdLevel,
      bestRoutes: sanitizedBestRoutes?.length,
      coordinates: sanitizedCoordinates,
      transportOptions: sanitizedTransportOptions
    });

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId,
          placeName: sanitizedName,
          placeDescription: sanitizedDescription,
          placeLocation: sanitizedLocation,
          placeImage: sanitizedImage,
          coordinates: sanitizedCoordinates,
          rating: sanitizedRating,
          categories: sanitizedCategories,
          bestTimeToVisit: sanitizedBestTimeToVisit,
          duration: sanitizedDuration,
          distance: sanitizedDistance,
          priceLevel: sanitizedPriceLevel,
          temperature: sanitizedTemperature,
          crowdLevel: sanitizedCrowdLevel,
          bestRoutes: sanitizedBestRoutes,
          transportOptions: sanitizedTransportOptions
        }),
      });

      if (!response.ok) {
        // Revert on error
        setIsFavorited(!isFavorited);
        throw new Error('Failed to update favorite');
      }

      const data = await response.json();
      // Update with actual server state
      setIsFavorited(data.favorited);
      toast.success(data.favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: placeName,
          url: placeUrl,
        });
      } else {
        await navigator.clipboard.writeText(placeUrl);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  const handleAddToItinerary = async () => {
    if (!session) {
      toast.error('Please sign in to add places to itinerary');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    // Ensure we're using the selected date, not a previous onethen go through all
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Please select a date in the future');
      return;
    }

    setIsLoading(true);
    
    // Validate and clean up data
    const sanitizedName = placeName || 'Unknown Place';
    const sanitizedDescription = placeDescription || 'No description available';
    const sanitizedLocation = placeLocation || 'Unknown Location';
    const sanitizedImage = placeImage && typeof placeImage === 'string' && placeImage !== 'undefined'  ? placeImage : '/placeholder.jpg';
    const sanitizedRating = typeof rating === 'number' ? rating : 0;     
    const sanitizedCategories = Array.isArray(categories) ? categories : [];
    const sanitizedBestTimeToVisit = bestTimeToVisit || 'Anytime';
    const sanitizedDuration = duration || '1-2 hours';
    const sanitizedGoodFor = Array.isArray(goodFor) ? goodFor : [];
    const sanitizedDistance = distance || 'Unknown';
    const sanitizedPriceLevel = typeof priceLevel === 'number' ? priceLevel : 1;
    const sanitizedTemperature = temperature || 'N/A';
    const sanitizedCrowdLevel = crowdLevel || 'Moderate';
    const sanitizedBestRoutes = Array.isArray(bestRoutes) ? bestRoutes : [];
    const sanitizedCoordinates = coordinates || { lat: 0, lng: 0 };
    const sanitizedTransportOptions = Array.isArray(transportOptions) ? transportOptions : [];
    
    console.log('Adding to itinerary with data:', {
      placeId,
      name: sanitizedName,
      location: sanitizedLocation, 
      description: sanitizedDescription?.substring(0, 20) + '...',
      image: sanitizedImage?.substring(0, 30) + '...',
      date: selectedDate.toLocaleDateString(),
      coordinates: sanitizedCoordinates,
      transportOptions: sanitizedTransportOptions
    });
    
    try {
      // Fetch complete attraction data to include in the itinerary
      const attractionResponse = await fetch(`/api/places/${placeId}`);
      let attractionData = {};
      
      if (attractionResponse.ok) {
        const data = await attractionResponse.json();
        attractionData = data;
        console.log('Fetched attraction data for itinerary:', attractionData);
      } else {
        console.warn('Could not fetch complete attraction data, using provided props');
      }
      
      // Make sure all place data is included when adding to itinerary
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId,
          placeName: sanitizedName,
          placeDescription: sanitizedDescription,
          placeLocation: sanitizedLocation,
          placeImage: sanitizedImage,
          date: selectedDate.toISOString(),
          ...(attractionData || {}),
          rating: sanitizedRating,
          categories: sanitizedCategories,
          bestTimeToVisit: sanitizedBestTimeToVisit,
          duration: sanitizedDuration,
          goodFor: sanitizedGoodFor,
          distance: sanitizedDistance,
          priceLevel: sanitizedPriceLevel,
          temperature: sanitizedTemperature,
          crowdLevel: sanitizedCrowdLevel,
          bestRoutes: sanitizedBestRoutes,
          coordinates: sanitizedCoordinates,
          transportOptions: sanitizedTransportOptions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Itinerary API error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error || 'Failed to add to itinerary');
      }

      toast.success('Added to itinerary');
      // Close the dialog after successful addition
      const dialogTrigger = document.querySelector('[data-state="open"]');
      if (dialogTrigger) {
        (dialogTrigger as HTMLButtonElement).click();
      }
    } catch (error) {
      console.error('Error adding to itinerary:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFavorite}
        disabled={isLoading}
        className={`transition-colors duration-200 ${
          isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-600'
        }`}
      >
        <Heart 
          className={`h-5 w-5 transition-transform duration-200 ${
            isFavorited ? 'fill-current scale-110' : ''
          }`} 
        />
        <span className="sr-only">
          {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleShare}
        disabled={isLoading}
      >
        <Share2 className="h-5 w-5" />
        <span className="sr-only">Share</span>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
          >
            <CalendarPlus className="h-5 w-5" />
            <span className="sr-only">Add to itinerary</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Itinerary</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">`Select a future date to visit {placeName}`</p>
            <div className="rounded-md border overflow-hidden">
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate || undefined}
                minDate={new Date()}
                className="w-full"
              />
            </div>
            {selectedDate && (
              <p className="text-sm mt-2 text-center text-primary font-medium">
                Selected date: {selectedDate.toLocaleDateString()}
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleAddToItinerary}
                disabled={!selectedDate || isLoading}
              >
                {isLoading ? 'Adding...' : 'Add to Itinerary'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
