'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Info, Trash2, Star, Clock, Navigation, ExternalLink, MapIcon, Filter, PlaneTakeoff, CloudRain, Thermometer, Users, X, RefreshCcw, Route, Car, Bus, Train, Footprints, DollarSign, Bike, Truck } from 'lucide-react';
import Image from 'next/image';
import { format, isBefore, isAfter, startOfDay } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {getWeatherData, getForecast} from '@/lib/api/weather';
import { Badge } from "@/components/ui/badge";
import { WeatherChart } from '@/components/explore/weather-chart';
import { getAllTransportationOptions } from '@/lib/openroute';
import { formatDistance, formatDuration } from '@/lib/openroute';
import { TransportMode } from '@/types/transportation';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ItineraryItem {
  _id: string;
  placeId: string;
  placeName: string;
  placeDescription: string;
  placeLocation: string;
  placeImage: string;
  date: string;
  createdAt: string;
  rating?: number;
  bestTimeToVisit?: string;
  duration: string;
  distance: string;
  priceLevel: number;
  categories: string[];
  goodFor: string[];
  temperature: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  crowdLevel?: string;
  bestRoutes?: string[];
  weatherForecast: {
    main?: {
      temp?: number;
      humidity?: number;
    };
    weather?: Array<{
      description: string;
      icon: string;
    }>;
  };
  transportationData: {
    [key in TransportMode]: {
      distance: number;
      duration: number;
    };
  };
}

export default function ItineraryPage() {
  const { data: session, status } = useSession();
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showFullDetails, setShowFullDetails] = useState(false);
  const mountedRef = useRef(false);

  const fetchItinerary = useCallback(async () => {
    if (status === 'authenticated' && session) {
      console.log('Fetching itinerary data...');
      setIsLoading(true);

      try {
        const response = await fetch('/api/itinerary');

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched itinerary data:', data);
          
          // Process the data to ensure all required fields are present
          const processedData = data.map((item: any) => {
            console.log('Processing itinerary item:', item.placeName, 'Image:', item.placeImage);
            
            // Check if _id is present
            if(!item._id) {
              console.error('Invalid item:', item);
              return null;
            }

            // Ensure all fields have proper values
            const validItem = {
              ...item,
              _id: item._id || `temp-${Date.now()}-${Math.random()}`,
              placeId: item.placeId || '',
              placeName: item.placeName || 'Unknown Place',
              placeDescription: item.placeDescription || 'No description available',
              placeLocation: item.placeLocation || 'Unknown Location',
              placeImage: (item.placeImage && item.placeImage !== 'undefined') ? item.placeImage : '/placeholder.jpg',
              temperature: item.temperature || 'Moderate',
              weatherForecast: item.weatherForecast || { main: {}, weather: [] },
              crowdLevel: item.crowdLevel || 'Moderate',
              bestRoutes: item.bestRoutes || [],
              rating: item.rating || 'N/A',
              bestTimeToVisit: item.bestTimeToVisit || 'Morning',
              duration: item.duration || '1-2 hours',
              distance: item.distance || 'Nearby',
              coordinates: {
                lat: item.coordinates?.lat || 0,
                lng: item.coordinates?.lng || 0
              },
              priceLevel: item.priceLevel || 1,
              categories: item.categories || ['Tourist Spot'],
              goodFor: item.goodFor || ['Everyone'],
              transportationData: item.transportationData || {},
            };
            
            // Log the processed item
            console.log('Processed itinerary item:', {
              id: validItem._id,
              placeId: validItem.placeId,
              name: validItem.placeName,
              location: validItem.placeLocation,
              image: validItem.placeImage?.substring(0, 30) + '...',
              date: new Date(validItem.date).toLocaleDateString(),
              coordinates: validItem.coordinates
            });
            
            return validItem;
          });
          
          setItinerary(processedData);
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
        toast.error('Failed to load itinerary');
      } finally {
        setIsLoading(false);
      }
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setItinerary([]);
    }
  }, [session]);

  useEffect(() => {
    fetchItinerary();
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [status, fetchItinerary]);

  // Fetch fresh weather and forecast whenever a favorite is selected
/* useEffect(() => {
  const fetchWeatherAndForecast = async () => {
    if (!selectedItem) return;

    const { coordinates } = selectedItem;

    try {
      const weatherRes = await fetch(`/api/weather?lat=${coordinates.lat}&lon=${coordinates.lng}`);
      if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(`/api/forecast?lat=${coordinates.lat}&lon=${coordinates.lng}`);
      if (!forecastRes.ok) throw new Error('Failed to fetch forecast data');
      const forecastData = await forecastRes.json();

      const updatedFavorite: ItineraryItem = {
        ...selectedItem,
        temperature: weatherData?.main?.temp || selectedItem.temperature,
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
      setItinerary((prev) =>
        prev.map((fav) => (fav._id === selectedItem._id ? updatedFavorite : fav))
      );
      setSelectedItem(updatedFavorite);
    } catch (error) {
      console.error('Error fetching weather/forecast:', error);
      toast.error('Error fetching weather information.');
    }
  };

  fetchWeatherAndForecast();
}, [selectedItem?.coordinates]); */

  const removeItineraryItem = async (itineraryId: string) => {
    if (!session) return;
    
    setIsRemoving(itineraryId);
    try {
      const response = await fetch(`/api/itinerary/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itineraryId 
        }),
      });

      if (response.ok) {
        // Update the UI by filtering out the removed item
        setItinerary(prevItems => prevItems.filter(item => item._id !== itineraryId));
        toast.success('Removed from itinerary');
      } else {
        throw new Error('Failed to remove itinerary item');
      }
    } catch (error) {
      console.error('Error removing itinerary item:', error);
      toast.error('Failed to remove from itinerary');
    } finally {
      setIsRemoving(null);
    }
  };

  const clearAllItineraryItems = async () => {
    if (!session || itinerary.length === 0) return;
    
    setIsRemovingAll(true);
    try {
      const response = await fetch(`/api/itinerary/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setItinerary([]);
        toast.success('Itinerary cleared');
      } else {
        throw new Error('Failed to clear itinerary');
      }
    } catch (error) {
      console.error('Error clearing itinerary:', error);
      toast.error('Failed to clear itinerary');
    } finally {
      setIsRemovingAll(false);
    }
  };

  // Open detail dialog for an itinerary item
  const handleViewDetail = async (item: ItineraryItem) => {
    try {
      toast.loading('Fetching latest weather info...', { id: 'weatherFetch' });
      const weatherData = await getWeatherData(item.coordinates.lat, item.coordinates.lng);
      const updatedItem: ItineraryItem = {
        ...item,
        temperature: weatherData?.main?.temp || item.temperature,
        weatherForecast: {
          main: {
            humidity: weatherData?.main?.humidity,
            temp: weatherData?.main?.temp
          },
          weather: weatherData?.weather ? [{
            description: weatherData.weather[0]?.description || 'UNKNOWN',
            icon: weatherData.weather[0]?.icon || ''
          }] : item.weatherForecast?.weather
        }
      };
      setItinerary((prev) =>
        prev.map((fav) => (fav._id === item._id ? updatedItem : fav))
      );
      setSelectedItem(updatedItem);
      setOpenDetailDialog(true);
      toast.success('Latest weather info loaded', { id: 'weatherFetch' });
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      toast.error('Failed to load latest weather info', { id: 'weatherFetch' });
      // Even on failure, open dialog with existing data to avoid blocking UI
      setSelectedItem(item);
      setOpenDetailDialog(true);
    }
  };

  // Group itinerary items by date
  const groupedItinerary = itinerary.reduce((groups, item) => {
    const date = new Date(item.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, ItineraryItem[]>);

  // Filter dates based on the active filter
  const getFilteredDates = () => {
    const today = startOfDay(new Date());
    
    let filteredDates = Object.keys(groupedItinerary);
    
    if (activeFilter === 'upcoming') {
      filteredDates = filteredDates.filter(date => 
        !isBefore(new Date(date), today)
      );
    } else if (activeFilter === 'past') {
      filteredDates = filteredDates.filter(date => 
        isBefore(new Date(date), today)
      );
    }
    
    return filteredDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  // Get trip statistics
  const getStats = () => {
    const today = startOfDay(new Date());
    
    const totalTrips = Object.keys(groupedItinerary).length;
    const upcomingTrips = Object.keys(groupedItinerary)
      .filter(date => !isBefore(new Date(date), today)).length;
    const totalPlaces = itinerary.length;
    
    return { totalTrips, upcomingTrips, totalPlaces };
  };

  async function fetchTransportationOptions(item: ItineraryItem) {
    if (!item.coordinates) {
      console.error('No coordinates available for item:', item.placeName);
      return [];
    }

    try {
      const routes = await getAllTransportationOptions(
        { lat: item.coordinates.lat, lng: item.coordinates.lng },
        { lat: item.coordinates.lat, lng: item.coordinates.lng }
      );
      return routes;
    } catch (error) {
      console.error('Error fetching transportation options:', error);
      return [];
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Your Itinerary</h1>
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
        <h1 className="text-2xl font-bold mb-6">Your Itinerary</h1>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Please sign in to view your itinerary.
          </p>
        </div>
      </div>
    );
  }

  const sortedDates = getFilteredDates();
  const stats = getStats();

  return (
    <div className="container mx-auto py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Your Itinerary
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchItinerary}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
                {itinerary.length > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={clearAllItineraryItems}
                          disabled={isRemovingAll}
                        >
                          {isRemovingAll ? 'Clearing...' : 'Clear All'}
                        </Button>
                )}
        </div>
      </div>
      {itinerary.length === 0 ? (
        <div className="text-center py-12 bg-background/50 rounded-lg shadow-sm border">
          <p className="text-lg text-muted-foreground">
            Your itinerary is empty. Start adding places from the explore section!
          </p>
        </div>
      ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {itinerary.map((item) => (
            <Card key={item._id} className="overflow-hidden card-hover">
                      <div className="relative h-48">
                          <Image
                  src={item.placeImage || '/placeholder.jpg'}
                            alt={item.placeName}
                            fill
                            className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{item.placeName}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{item.placeLocation}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.categories?.map((category, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
                    >
                      {category}
                    </span>
                  ))}
                        </div>

                <div className="grid grid-cols-2 gap-3">
                  {item.rating && item.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Rating</p>
                        <p className="text-sm text-muted-foreground">
                          {item.rating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {item.duration && (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">{item.duration}</p>
                          </div>
                        </div>
                  )}
                  
                  {item.bestTimeToVisit && (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Best Time</p>
                        <p className="text-sm text-muted-foreground">{item.bestTimeToVisit}</p>
                          </div>
                              </div>
                            )}
                  
                  {item.crowdLevel && (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="h-4 w-4 text-purple-500" />
                              </div>
                      <div>
                        <p className="text-sm font-medium">Crowd Level</p>
                        <p className="text-sm text-muted-foreground">{item.crowdLevel}</p>
                              </div>
                              </div>
                            )}
                  {item.transportationData && Object.entries(item.transportationData).map(([mode, data]) => (
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
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
                    <Info className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedItem(item);
                    setShowFullDetails(true);
                  }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Full Details
                        </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeItineraryItem(item._id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                        </Button>
                      </CardFooter>
                    </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[85vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Left side - Image */}
              <div className="relative h-64 lg:h-[400px]">
                <Image
                  src={selectedItem.placeImage}
                  alt={selectedItem.placeName}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Button 
                    size="icon" 
                    variant="destructive"
                    className="h-8 w-8 rounded-full bg-background/80"
                    onClick={() => {
                      removeItineraryItem(selectedItem._id);
                      setOpenDetailDialog(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedItem.placeName}</h2>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedItem.placeLocation}</span>
                    </div>
                    {selectedItem.rating && selectedItem.rating > 0 && (
                      <div className="mt-2 bg-white text-primary font-semibold rounded-md py-1 px-2 inline-flex items-center">
                        <Star className="h-4 w-4 fill-primary mr-1" />
                        <span className="font-medium">
                          {selectedItem.rating.toFixed(1)}
                        </span>
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
                      {selectedItem.placeDescription}
                    </p>
                  </div>
                  
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-3">Key Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedItem.bestTimeToVisit && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Best Time to Visit</p>
                            <p className="text-sm text-muted-foreground">{selectedItem.bestTimeToVisit}</p>
                          </div>
                        </div>
                      )}
                      {selectedItem.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">{selectedItem.duration}</p>
                          </div>
                        </div>
                      )}
                      {selectedItem.distance && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <Navigation className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Distance</p>
                            <p className="text-sm text-muted-foreground">{selectedItem.distance}</p>
                          </div>
                        </div>
                      )}
                      {selectedItem.priceLevel && selectedItem.priceLevel > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-background p-2 rounded-full">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Price Level</p>
                            <p className="text-sm text-muted-foreground">
                              {'$'.repeat(selectedItem.priceLevel)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Weather and crowd information */}
                  {(selectedItem.temperature || selectedItem.weatherForecast || selectedItem.crowdLevel) && (
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <h3 className="text-md font-semibold mb-3">Conditions</h3>
                      <div className="space-y-4">
                        {selectedItem.coordinates && (
                          <div className="w-full bg-background/50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <CloudRain className="h-4 w-4 text-primary" />
                              Weather Forecast
                            </h4>
                            <div className="h-[200px] w-full">
                              <WeatherChart 
                                lat={selectedItem.coordinates.lat} 
                                lng={selectedItem.coordinates.lng}
                              />
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedItem.temperature && (
                            <div className="flex items-center gap-2 text-sm bg-background/50 p-3 rounded-lg">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Thermometer className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Temperature</p>
                                <p className="text-sm text-muted-foreground">{selectedItem.temperature}°C</p>
                              </div>
                            </div>
                          )}
                          {selectedItem.crowdLevel && (
                            <div className="flex items-center gap-2 text-sm bg-background/50 p-3 rounded-lg">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Crowd Level</p>
                                <p className="text-sm text-muted-foreground">{selectedItem.crowdLevel}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Best routes */}
                  {selectedItem.bestRoutes && selectedItem.bestRoutes.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Best Routes</h3>
                      <ul className="space-y-2">
                        {selectedItem.bestRoutes.map((route, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Route className="h-4 w-4 text-primary mt-0.5" />
                            <span className="text-sm">{route}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedItem.categories && selectedItem.categories.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.categories.map((category, index) => (
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
                  
                  {selectedItem.goodFor && selectedItem.goodFor.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-3">Good For</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.goodFor.map((item, index) => (
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
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Details View */}
      {showFullDetails && selectedItem && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container max-w-7xl mx-auto p-6 min-h-screen">
            <div className="bg-card rounded-lg shadow-lg p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedItem.placeName}</h2>
                  <p className="text-lg text-muted-foreground">{selectedItem.placeDescription}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowFullDetails(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="relative h-[400px] rounded-lg overflow-hidden">
                    <Image
                      src={selectedItem.placeImage || '/placeholder.jpg'}
                      alt={selectedItem.placeName}
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
                          <p className="text-lg">{selectedItem.placeLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Best Time to Visit</p>
                          <p className="text-lg">{selectedItem.bestTimeToVisit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Duration</p>
                          <p className="text-lg">{selectedItem.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {selectedItem.coordinates && (
                    <div className="bg-accent/10 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Weather Forecast</h3>
                      <div className="bg-background/50 rounded-lg p-4">
                        <WeatherChart 
                          lat={selectedItem.coordinates.lat} 
                          lng={selectedItem.coordinates.lng} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-accent/10 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Transportation Options</h3>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Transportation Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedItem.bestRoutes?.map((route, index) => {
                          const [mode, ...details] = route.split(':');
                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                            >
                              <div className="p-2 rounded-full bg-secondary/20">
                                {mode.toLowerCase().includes('car') && <Car className="w-5 h-5" />}
                                {mode.toLowerCase().includes('bus') && <Bus className="w-5 h-5" />}
                                {mode.toLowerCase().includes('train') && <Train className="w-5 h-5" />}
                                {mode.toLowerCase().includes('walk') && <Footprints className="w-5 h-5" />}
                                {mode.toLowerCase().includes('bicycle') && <Bike className="w-5 h-5" />}
                                {mode.toLowerCase().includes('hiking') && <Footprints className="w-5 h-5" />}
                                {mode.toLowerCase().includes('truck') && <Truck className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-medium">{mode}</p>
                                <p className="text-sm text-muted-foreground">{details.join(':')}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/10 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
                    <div className="space-y-6">
                      {selectedItem.categories && selectedItem.categories.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.categories.map((category, index) => (
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
                      
                      {selectedItem.goodFor && selectedItem.goodFor.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Good For</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.goodFor.map((item, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
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