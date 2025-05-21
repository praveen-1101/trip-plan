'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  Heart, 
  Navigation, 
  Thermometer, 
  CloudRain, 
  Users, 
  Route 
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface Favorite {
  _id: string;
  placeId: string;
  placeName: string;
  placeDescription: string;
  placeLocation: string;
  placeImage: string;
  createdAt: string;
  rating: number;
  bestTimeToVisit: string;
  duration: string;
  distance: string;
  priceLevel: number;
  categories: string[];
  goodFor: string[];
  temperature: string;
  weatherForecast: string;
  crowdLevel: string;
  bestRoutes: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function FavoriteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState<Favorite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const fetchFavoriteDetail = async () => {
      try {
        const response = await fetch(`/api/favorites/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch favorite: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded favorite detail:', data);
        setFavorite(data);
      } catch (error) {
        console.error('Error fetching favorite details:', error);
        toast.error('Failed to load favorite details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteDetail();
  }, [params.id]);

  const removeFavorite = async () => {
    if (!favorite) return;
    
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/favorites/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          favoriteId: favorite._id 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove favorite: ${response.status}`);
      }

      toast.success('Removed from favorites');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('favorites-updated'));
      
      // Navigate back to favorites page
      router.push('/favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 mt-16">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-72 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!favorite) {
    return (
      <div className="container mx-auto py-8 mt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Favorite Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The favorite you're looking for could not be found.
          </p>
          <Button onClick={() => router.push('/favorites')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Favorites
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 mt-16">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.push('/favorites')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Favorites
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
          <Image
            src={favorite.placeImage}
            alt={favorite.placeName}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{favorite.placeName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{favorite.placeLocation}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {favorite.rating > 0 && (
                <div className="bg-primary/10 text-primary font-semibold rounded-md py-1 px-2 flex items-center">
                  <Star className="h-4 w-4 fill-primary mr-1" />
                  <span>{favorite.rating}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-muted-foreground">
                {favorite.placeDescription}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {favorite.bestTimeToVisit && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Best Time to Visit</p>
                    <p className="text-sm text-muted-foreground">{favorite.bestTimeToVisit}</p>
                  </div>
                </div>
              )}
              
              {favorite.duration && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{favorite.duration}</p>
                  </div>
                </div>
              )}
              
              {favorite.distance && (
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Distance</p>
                    <p className="text-sm text-muted-foreground">{favorite.distance}</p>
                  </div>
                </div>
              )}
              
              {favorite.temperature && (
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-sm text-muted-foreground">{favorite.temperature}</p>
                  </div>
                </div>
              )}
              
              {favorite.weatherForecast && (
                <div className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Weather Forecast</p>
                    <p className="text-sm text-muted-foreground">{favorite.weatherForecast}</p>
                  </div>
                </div>
              )}
              
              {favorite.crowdLevel && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Crowd Level</p>
                    <p className="text-sm text-muted-foreground">{favorite.crowdLevel}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="flex gap-4">
                <Button 
                  variant="destructive"
                  onClick={removeFavorite}
                  disabled={isRemoving}
                  className="flex items-center gap-2"
                >
                  {isRemoving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Heart className="h-4 w-4 fill-current" />
                  )}
                  {isRemoving ? 'Removing...' : 'Remove from Favorites'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {favorite.categories && favorite.categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {favorite.categories.map((category, index) => (
                  <div 
                    key={index} 
                    className="bg-accent/20 px-3 py-1 rounded-full text-sm"
                  >
                    {category}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {favorite.goodFor && favorite.goodFor.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Good For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {favorite.goodFor.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-accent/20 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {favorite.bestRoutes && favorite.bestRoutes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Best Routes</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {favorite.bestRoutes.map((route, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Route className="h-5 w-5 text-primary mt-0.5" />
                    <span>{route}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Price level indicator */}
      {favorite.priceLevel > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Price Level</h2>
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">
              {Array.from({ length: favorite.priceLevel }).map((_, i) => (
                <span key={i} className="text-primary">$</span>
              ))}
              {Array.from({ length: 4 - favorite.priceLevel }).map((_, i) => (
                <span key={i} className="text-muted-foreground/30">$</span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({favorite.priceLevel === 1 ? 'Inexpensive' : 
                favorite.priceLevel === 2 ? 'Moderate' : 
                favorite.priceLevel === 3 ? 'Expensive' : 'Very Expensive'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 