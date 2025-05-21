'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MapPin, Star, Clock, DollarSign, Calendar, ArrowLeft, Car, Bus, Footprints, Bike } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlaceDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [place, setPlace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [transportationData, setTransportationData] = useState<{
    [key: string]: { distance: number; duration: number }
  }>({});

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get your location');
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        const response = await fetch(`/api/places/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch place details');
        const data = await response.json();
        setPlace(data);
        
        // Fetch transportation data for each mode
        if (userLocation && data.coordinates) {
          ['car', 'bus', 'walking', 'cycling'].forEach(async (mode) => {
            try {
              const transportResponse = await fetch('/api/transportation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  start: userLocation,
                  end: { lat: data.coordinates.lat, lng: data.coordinates.lng },
                  mode
                }),
              });
              
              if (transportResponse.ok) {
                const transportData = await transportResponse.json();
                setTransportationData(prev => ({
                  ...prev,
                  [mode]: {
                    distance: transportData.distance,
                    duration: transportData.duration
                  }
                }));
              }
            } catch (error) {
              console.error(`Error fetching ${mode} transportation data:`, error);
            }
          });
        }
      } catch (error) {
        toast.error('Failed to fetch place details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [params.id, userLocation]);

  const handleAddToFavorites = async () => {
    if (!session) {
      toast.error('Please sign in to add places to favorites');
      return;
    }

    try {
      const response = await fetch('/api/favorites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: place.id,
          placeName: place.name,
          placeDescription: place.description,
          placeLocation: place.location,
          placeImage: place.photos?.[0]?.url,
          coordinates: {
            lat: place.coordinates.lat,
            lng: place.coordinates.lng
          },
          transportationData
        }),
      });

      if (!response.ok) throw new Error('Failed to add to favorites');
      
      toast.success('✔️ Added to Favorites');
    } catch (error) {
      toast.error('Failed to add to favorites');
    }
  };

  const handleAddToItinerary = async () => {
    if (!session) {
      toast.error('Please sign in to add places to your itinerary');
      return;
    }

    try {
      const response = await fetch('/api/itinerary/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: place.id,
          placeName: place.name,
          placeDescription: place.description,
          placeLocation: place.location,
          placeImage: place.photos?.[0]?.url,
          coordinates: {
            lat: place.coordinates.lat,
            lng: place.coordinates.lng
          },
          transportationData
        }),
      });

      if (!response.ok) throw new Error('Failed to add to itinerary');
      
      toast.success('✔️ Added to Itinerary');
    } catch (error) {
      toast.error('Failed to add to itinerary');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Place not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-8">
          {/* Main Image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={place.photos?.[0]?.url || '/placeholder.jpg'}
              alt={place.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Place Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{place.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {place.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>{place.rating} ({place.userRatingsTotal} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{place.openingHours?.openNow ? 'Open Now' : 'Closed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>{'$'.repeat(place.priceLevel || 1)}</span>
                </div>
              </div>

              {/* Transportation Options */}
              {Object.keys(transportationData).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Transportation Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(transportationData).map(([mode, data]) => (
                      <Card key={mode} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              {mode === 'car' && <Car className="h-5 w-5" />}
                              {mode === 'bus' && <Bus className="h-5 w-5" />}
                              {mode === 'walking' && <Footprints className="h-5 w-5" />}
                              {mode === 'cycling' && <Bike className="h-5 w-5" />}
                            </div>
                            <span className="text-sm font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              {data.duration} mins • {data.distance} km
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p>{place.description || 'No description available.'}</p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleAddToFavorites}
              >
                <Heart className="h-4 w-4 mr-2" />
                Add to Favorites
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddToItinerary}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Itinerary
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 