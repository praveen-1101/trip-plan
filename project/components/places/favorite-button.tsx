'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  placeId: string;
  placeName?: string;
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
  temperature?: string;
  crowdLevel?: string;
  bestRoutes?: string[];
}

export function FavoriteButton({ 
  placeId, 
  placeName = 'Unknown Place',
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
  temperature = '',
  crowdLevel = '',
  bestRoutes = []
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check initial favorite status
  const checkFavoriteStatus = useCallback(async () => {
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
  }, [session, placeId]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!session) {
      toast.error('Please sign in to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      // Make sure we send all the necessary data
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
      const sanitizedCrowdLevel = crowdLevel || 'Moderate';
      const sanitizedBestRoutes = Array.isArray(bestRoutes) ? bestRoutes : [];
      
      
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          placeId,
          placeName: sanitizedName,
          placeDescription: sanitizedDescription,
          placeLocation: sanitizedLocation,
          placeImage: sanitizedImage,
          rating: sanitizedRating,
          bestTimeToVisit: sanitizedBestTimeToVisit,
          duration: sanitizedDuration,
          distance: sanitizedDistance,
          priceLevel: sanitizedPriceLevel,
          categories: sanitizedCategories,
          goodFor: sanitizedGoodFor,
          temperature: sanitizedTemperature,
          crowdLevel: sanitizedCrowdLevel,
          bestRoutes: sanitizedBestRoutes
        }),
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      const data = await response.json();
      console.log('Favorite toggle response:', data);
      
      // Update UI state with the server response
      setIsFavorited(data.favorited);
      
      // Show success message
      toast.success(data.favorited ? 'Added to favorites' : 'Removed from favorites');
      
      // Trigger a global refresh event for the favorites page
      if (typeof window !== 'undefined') {
        // Use a custom event with data
        const event = new CustomEvent('favorites-updated', { 
          detail: data.favorited ? data.favorite : null 
        });
        window.dispatchEvent(event);
        
        // Also use a more common event for compatibility
        window.dispatchEvent(new Event('favorites-updated'));
      }
      
      // Force router refresh to update any cached pages
      router.refresh();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={isFavorited ? 'text-red-500' : 'text-gray-500'}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
      <span className="sr-only">
        {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  );
}
