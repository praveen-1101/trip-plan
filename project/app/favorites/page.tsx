'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Heart, Info, Trash2, RefreshCcw, ExternalLink, Star, Calendar, Navigation, Clock, Thermometer, CloudRain, Users, Route, X, Car, Bus, Train, Footprints, Bike } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getWeatherData, getForecast } from '@/lib/api/weather';
import { formatDistance, formatDuration } from '@/lib/openroute';
import { TransportMode } from '@/types/transportation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WeatherChart } from '@/components/explore/weather-chart';

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
  temperature: number;
  weatherForecast: {
    main?: {
      humidity?: number;
      temp?: number;
    };
    weather?: Array<{
      description: string;
      icon: string;
    }>;
  };
  crowdLevel: string;
  bestRoutes: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  transportationData: {
    [key in TransportMode]: {
      distance: number;
      duration: number;
    };
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const mountedRef = useRef(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);


  // Enhanced fetchFavorites with better error handling and logging
  const fetchFavorites = useCallback(async () => {
    if (status === 'authenticated' && session) {
      console.log('Fetching favorites data...');
      setIsLoading(true);
      
      try {
        // Use cache: no-store to avoid stale data
        const response = await fetch('/api/favorites', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.error('Error response from API:', response.status, response.statusText);
          throw new Error(`Failed to fetch favorites: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched favorites data:', data);
        
        if (!Array.isArray(data)) {
          console.error('Unexpected data format (not an array):', data);
          toast.error('Invalid data received from server');
          setFavorites([]);
          return;
        }
        
        // Process the data to ensure all required fields are present
        const processedData = data.map((favorite: any) => {
          // Log each favorite as received
          console.log('Raw favorite data:', favorite);
          
          // Check if _id is present
          if (!favorite._id) {
            console.error('Favorite missing _id:', favorite);
          }
          
          // Ensure all fields have proper values
          const validItem = {
            ...favorite,
            _id: favorite._id || `temp-${Date.now()}-${Math.random()}`,
            placeId: favorite.placeId || '',
            placeName: favorite.placeName || 'Unknown Place',
            placeDescription: favorite.placeDescription || 'No description available',
            placeLocation: favorite.placeLocation || 'Unknown Location',
            placeImage: (favorite.placeImage && favorite.placeImage !== 'undefined') 
              ? favorite.placeImage 
              : '/placeholder.jpg',
            rating: favorite.rating || 'N/A',
            bestTimeToVisit: favorite.bestTimeToVisit || 'Morning',
            duration: favorite.duration || '1-2 hours',
            distance: favorite.distance || 'Nearby',
            priceLevel: favorite.priceLevel || 1,
            categories: favorite.categories || ['Tourist Spot'],
            goodFor: favorite.goodFor || ['Everyone'],
            temperature: favorite.temperature || 'Moderate',
            weatherForecast: favorite.weatherForecast || { main: {}, weather: [] },
            crowdLevel: favorite.crowdLevel || 'Moderate',
            bestRoutes: favorite.bestRoutes || [],
            coordinates: {
              lat: favorite.coordinates.lat || 0,
              lng: favorite.coordinates.lng || 0
            },
            transportationData: favorite.transportationData || {}
          };
          // Log the processed data
          console.log('Processed favorite:', {
            id: validItem._id,
            name: validItem.placeName,
            location: validItem.placeLocation,
            coordinates: validItem.coordinates,
            transportationData: validItem.transportationData
          });
          
          return validItem;
        });
        
        setFavorites(processedData);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setFavorites([]);
    }
  }, [status, session]);

  // Initial load
  useEffect(() => {
    fetchFavorites();
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchFavorites, refreshKey]);

  // Fetch fresh weather and forecast whenever a favorite is selected
/* useEffect(() => {
  const fetchWeatherAndForecast = async () => {
    if (!selectedFavorite) return;

    const { coordinates } = selectedFavorite;

    try {
      const weatherRes = await fetch(`/api/weather?lat=${coordinates.lat}&lon=${coordinates.lng}`);
      if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(`/api/forecast?lat=${coordinates.lat}&lon=${coordinates.lng}`);
      if (!forecastRes.ok) throw new Error('Failed to fetch forecast data');
      const forecastData = await forecastRes.json();

      const updatedFavorite: Favorite = {
        ...selectedFavorite,
        temperature: weatherData?.main?.temp || selectedFavorite.temperature,
        weatherForecast: {
          main: {
            humidity: forecastData?.[0]?.main?.humidity,
            temp: forecastData?.[0]?.main?.temp
          },
          weather: forecastData?.[0]?.weather ? [{
            description: forecastData[0].weather.description,
            icon: forecastData[0].weather.icon
          }] : undefined
        }
      };
      setFavorites((prev) =>
        prev.map((fav) => (fav._id === selectedFavorite._id ? updatedFavorite : fav))
      );
      setSelectedFavorite(updatedFavorite);
    } catch (error) {
      console.error('Error fetching weather/forecast:', error);
      toast.error('Error fetching weather information.');
    }
  };

  fetchWeatherAndForecast();
}, [selectedFavorite?.coordinates]); */


  // Listen for favorites updates
  useEffect(() => {
    const handleFavoritesUpdated = (event: Event) => {
      console.log('Favorites updated event received');
      if (mountedRef.current) {
        fetchFavorites();
      }
    };
    
    // Also listen for the custom event with data
    const handleFavoritesUpdatedWithData = (event: CustomEvent) => {
      console.log('Favorites updated event with data:', event.detail);
      if (mountedRef.current) {
        fetchFavorites();
      }
    };
    
    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    window.addEventListener('favorites-updated', handleFavoritesUpdatedWithData as EventListener);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
      window.removeEventListener('favorites-updated', handleFavoritesUpdatedWithData as EventListener);
    };
  }, [fetchFavorites]);

  const removeFavorite = async (favoriteId: string) => {
    if (!session) return;
    
    setIsRemoving(favoriteId);
    try {
      const response = await fetch(`/api/favorites/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          favoriteId 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove favorite: ${response.status}`);
      }

      // Update the UI by filtering out the removed favorite
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav._id !== favoriteId));
      toast.success('Removed from favorites');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('favorites-updated'));
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setIsRemoving(null);
    }
  };

  const clearAllFavorites = async () => {
    if (!session || favorites.length === 0) return;
    
    setIsRemovingAll(true);
    try {
      const response = await fetch(`/api/favorites/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to clear favorites: ${response.status}`);
      }

      setFavorites([]);
      toast.success('All favorites cleared');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('favorites-updated'));
    } catch (error) {
      console.error('Error clearing favorites:', error);
      toast.error('Failed to clear all favorites');
    } finally {
      setIsRemovingAll(false);
    }
  };

  // Force refresh data
  const refreshData = () => {
    console.log('Manual refresh triggered');
    fetchFavorites();
  };

  // Open detail dialog for a favorite
  const handleViewDetail = async (favorite: Favorite) => {
    try {
    toast.loading('Fetching latest weather info...', { id: 'weatherFetch' });
    const weatherData = await getWeatherData(favorite.coordinates.lat, favorite.coordinates.lng);
    const updatedFavorite: Favorite = {
      ...favorite,
      temperature: weatherData?.main?.temp || favorite.temperature,
      weatherForecast: {
        main: {
          humidity: weatherData?.main?.humidity,
          temp: weatherData?.main?.temp
        },
        weather: weatherData?.weather ? [{
          description: weatherData.weather[0]?.description || 'UNKNOWN',
          icon: weatherData.weather[0]?.icon || ''
        }] : favorite.weatherForecast?.weather
      }
    };
    setFavorites((prev) =>
      prev.map((fav) => (fav._id === favorite._id ? updatedFavorite : fav))
    );
    setSelectedFavorite(updatedFavorite);
    setOpenDetailDialog(true);
    toast.success('Latest weather info loaded', { id: 'weatherFetch' });
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    toast.error('Failed to load latest weather info', { id: 'weatherFetch' });

    // Even on failure, open dialog with existing data to avoid blocking UI
    setSelectedFavorite(favorite);
    setOpenDetailDialog(true);
  }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Please sign in to view your favorites.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500 fill-current" />
          Your Favorites
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {favorites.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={clearAllFavorites}
              disabled={isRemovingAll}
            >
              {isRemovingAll ? 'Clearing...' : 'Clear All'}
            </Button>
          )}
        </div>
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-background/50 rounded-lg shadow-sm border">
          <p className="text-lg text-muted-foreground">
            You haven't added any favorites yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            console.log('Rendering favorite card:', favorite.placeName);
            
            return (
              <Card key={favorite._id} className="overflow-hidden card-hover">
                <div className="relative h-48">
                    <Image
                    src={favorite.placeImage || '/placeholder.jpg'}
                      alt={favorite.placeName}
                      fill
                      className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{favorite.placeName}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{favorite.placeLocation}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {favorite.categories?.map((category, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {favorite.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Rating</p>
                          <p className="text-sm text-muted-foreground">{favorite.rating}/5</p>
                          </div>
                      </div>
                    )}
                    
                    {favorite.duration && (
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-sm text-muted-foreground">{favorite.duration}</p>
                          </div>
                      </div>
                    )}
                    
                    {favorite.temperature && (
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                    </div>
                        <div>
                          <p className="text-sm font-medium">Temperature</p>
                          <p className="text-sm text-muted-foreground">{favorite.temperature}°C</p>
                        </div>
                        </div>
                      )}
                    
                    {favorite.crowdLevel && (
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Crowd Level</p>
                          <p className="text-sm text-muted-foreground">{favorite.crowdLevel}</p>
                        </div>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {favorite.transportationData && Object.entries(favorite.transportationData).map(([mode, data]) => (
                      <div key={mode} className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {mode === 'driving-car' && <Car className="h-4 w-4 text-green-500" />}
                          {mode === 'foot-walking' && <Footprints className="h-4 w-4 text-pink-500" />}
                          {mode === 'cycling-regular' && <Bike className="h-4 w-4 text-teal-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {mode === 'driving-car' ? 'Car' : 
                             mode === 'foot-walking' ? 'Walking' : 
                             mode === 'cycling-regular' ? 'Cycling' : mode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistance(data.distance)} • {formatDuration(data.duration)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetail(favorite)}>
                    <Info className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeFavorite(favorite._id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedFavorite && (
        <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[85vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Left side - Image */}
              <div className="relative h-64 lg:h-[400px]">
                <Image
                  src={selectedFavorite.placeImage || '/placeholder.jpg'}
                  alt={selectedFavorite.placeName}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-2 right-2">
                  <Button 
                    size="icon" 
                    variant="destructive"
                    className="h-8 w-8 rounded-full bg-background/80"
                    onClick={() => {
                      removeFavorite(selectedFavorite._id);
                      setOpenDetailDialog(false);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedFavorite.placeName}</h2>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedFavorite.placeLocation}</span>
                    </div>
                    {selectedFavorite.rating > 0 && (
                      <div className="mt-2 bg-white text-primary font-semibold rounded-md py-1 px-2 inline-flex items-center">
                        <Star className="h-4 w-4 fill-primary mr-1" />
                        <span>{selectedFavorite.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right side - Details */}
              <div className="p-6 overflow-y-auto max-h-[500px]">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl">Place Details</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 overflow-y-auto pr-2">
                  <div>
                    <h3 className="text-md font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedFavorite.placeDescription}
                    </p>
                  </div>
                  
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-3">Key Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedFavorite.bestTimeToVisit && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Best Time to Visit</p>
                            <p className="text-sm text-muted-foreground">{selectedFavorite.bestTimeToVisit}</p>
                          </div>
                        </div>
                      )}
                      {selectedFavorite.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">{selectedFavorite.duration}</p>
                          </div>
                        </div>
                      )}
                      {selectedFavorite.distance && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <Navigation className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Distance</p>
                            <p className="text-sm text-muted-foreground">{selectedFavorite.distance}</p>
                          </div>
                        </div>
                      )}
                      {selectedFavorite.priceLevel > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <span className="h-4 w-4 text-primary font-bold flex items-center justify-center">$</span>
                          </div>
                          <div>
                            <p className="font-medium">Price Level</p>
                            <p className="text-sm text-muted-foreground">
                              {Array.from({ length: selectedFavorite.priceLevel }).map(() => '$').join('')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Weather and crowd information */}
                  {(selectedFavorite.temperature || selectedFavorite.weatherForecast || selectedFavorite.crowdLevel) && (
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <h3 className="text-md font-semibold mb-3">Conditions</h3>
                      <div className="space-y-4">
                        {selectedFavorite.coordinates && (
                          <div className="w-full bg-background/50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <CloudRain className="h-4 w-4 text-primary" />
                              Weather Forecast
                            </h4>
                            <div className="h-[200px] w-full">
                              <WeatherChart 
                                lat={selectedFavorite.coordinates.lat} 
                                lng={selectedFavorite.coordinates.lng}
                              />
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedFavorite.temperature && (
                            <div className="flex items-center gap-2 text-sm bg-background/50 p-3 rounded-lg">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Thermometer className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Temperature</p>
                                <p className="text-sm text-muted-foreground">{selectedFavorite.temperature}°C</p>
                              </div>
                            </div>
                          )}
                          {selectedFavorite.crowdLevel && (
                            <div className="flex items-center gap-2 text-sm bg-background/50 p-3 rounded-lg">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Crowd Level</p>
                                <p className="text-sm text-muted-foreground">{selectedFavorite.crowdLevel}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Best routes */}
                  {selectedFavorite.bestRoutes && selectedFavorite.bestRoutes.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Transportation Options</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedFavorite.bestRoutes.map((route, index) => {
                          const [mode, ...details] = route.split(':');
                          return (
                            <div key={index} className="bg-background/50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                {mode.toLowerCase().includes('car') && <Car className="h-4 w-4 text-primary" />}
                                {mode.toLowerCase().includes('bus') && <Bus className="h-4 w-4 text-primary" />}
                                {mode.toLowerCase().includes('train') && <Train className="h-4 w-4 text-primary" />}
                                {mode.toLowerCase().includes('walk') && <Footprints className="h-4 w-4 text-primary" />}
                                <span className="font-medium">{mode}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{details.join(':')}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {selectedFavorite.categories && selectedFavorite.categories.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedFavorite.categories.map((category, index) => (
                          <div 
                            key={index} 
                            className="bg-accent/20 px-3 py-1 rounded-full text-sm"
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedFavorite.goodFor && selectedFavorite.goodFor.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Good For</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedFavorite.goodFor.map((item, index) => (
                          <div 
                            key={index} 
                            className="bg-accent/20 px-3 py-1 rounded-full text-sm"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedFavorite.transportationData && Object.entries(selectedFavorite.transportationData).length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Transportation Options</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(selectedFavorite.transportationData).map(([mode, data]) => {
                        return (
                        <div key={mode} className="bg-background/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {mode === 'driving-car' && <Car className="h-4 w-4 text-primary" />}
                          {mode === 'foot-walking' && <Footprints className="h-4 w-4 text-primary" />}
                          {mode === 'cycling-regular' && <Bike className="h-4 w-4 text-primary" />}
                          <span className="font-medium capitalize">{mode.replace('-', ' ').replace('driving ', 'car ').replace('foot ', 'walking ').replace('cycling ', 'bike ')}</span>
                        </div>
                          <p className="text-sm text-muted-foreground">{data.distance.toFixed(1)}km • {Math.round(data.duration / 60)}min</p>
                        </div>
                        );
                       })}
                      </div>
                    </div>
                   )}
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      size="lg" 
                      className="gap-2"
                      onClick={() => {
                        setOpenDetailDialog(false);
                        setShowFullDetails(true);
                      }}
                    >
                      <span>View Full Details</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Details View */}
      {showFullDetails && selectedFavorite && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container max-w-7xl mx-auto p-6 min-h-screen">
            <div className="bg-card rounded-lg shadow-lg p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedFavorite.placeName}</h2>
                  <p className="text-lg text-muted-foreground">{selectedFavorite.placeDescription}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowFullDetails(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="relative h-[400px] rounded-lg overflow-hidden">
                    <Image
                      src={selectedFavorite.placeImage || '/placeholder.jpg'}
                      alt={selectedFavorite.placeName}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                  </div>

                  <div className="bg-accent/10 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Location Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Location</p>
                          <p className="text-lg">{selectedFavorite.placeLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Best Time to Visit</p>
                          <p className="text-lg">{selectedFavorite.bestTimeToVisit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Duration</p>
                          <p className="text-lg">{selectedFavorite.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {selectedFavorite.coordinates && (
                    <div className="bg-accent/10 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Weather Forecast</h3>
                      <div className="bg-background/50 rounded-lg p-4">
                        <WeatherChart 
                          lat={selectedFavorite.coordinates.lat} 
                          lng={selectedFavorite.coordinates.lng} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-accent/10 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
                    <div className="space-y-6">
                      {selectedFavorite.categories && selectedFavorite.categories.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedFavorite.categories.map((category, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedFavorite.goodFor && selectedFavorite.goodFor.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Good For</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedFavorite.goodFor.map((item, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedFavorite.bestRoutes && selectedFavorite.bestRoutes.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Transportation Options</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedFavorite.bestRoutes.map((route, index) => {
                              const [mode, ...details] = route.split(':');
                              return (
                                <div key={index} className="bg-background/50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    {mode.toLowerCase().includes('car') && <Car className="h-4 w-4 text-primary" />}
                                    {mode.toLowerCase().includes('bus') && <Bus className="h-4 w-4 text-primary" />}
                                    {mode.toLowerCase().includes('train') && <Train className="h-4 w-4 text-primary" />}
                                    {mode.toLowerCase().includes('walk') && <Footprints className="h-4 w-4 text-primary" />}
                                    <span className="font-medium">{mode}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{details.join(':')}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}