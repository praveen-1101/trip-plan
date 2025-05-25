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
              coordinates: validItem.coordinates,
              transportationData: validItem.transportationData
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
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupedItinerary[date].map((item) => (
                  <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
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
                      </div>

                      {/* {item.transportationData && Object.entries(item.transportationData).length > 0 && (
                        <div className="mt-4 space-y-2">
                          {Object.entries(item.transportationData).map(([mode, data]) => {
                            if (data === null || data === undefined) return null;
                            return (
                              <div key={mode} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  {mode === 'driving-car' && <Car className="h-4 w-4 text-primary" />}
                                  {mode === 'foot-walking' && <Footprints className="h-4 w-4 text-primary" />}
                                  {mode === 'cycling-regular' && <Bike className="h-4 w-4 text-primary" />}
                                  <span className="text-sm font-medium capitalize">
                                    {mode.replace('-', ' ').replace('driving ', '').replace('foot ', '').replace('regular', '')}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDistance(data.distance)} • {formatDuration(data.duration)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )} */}
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
                          <Info className="h-4 w-4 mr-2" />
                          View Details
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
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
          <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Left side - Image and Basic Info */}
              <div className="relative h-[40vh] lg:h-full">
                <Image
                  src={selectedItem.placeImage || '/placeholder.jpg'}
                  alt={selectedItem.placeName}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedItem.placeName}</h2>
                  <div className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" />
                    <span>{selectedItem.placeLocation}</span>
                  </div>
                  {selectedItem.rating && (
                    <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-2 inline-flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold">{selectedItem.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Details */}
              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedItem.placeDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Best Time to Visit</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedItem.bestTimeToVisit}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Duration</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedItem.duration}</p>
                    </div>
                  </div>

                  {selectedItem.transportationData && Object.entries(selectedItem.transportationData).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Transportation Options</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedItem.transportationData).map(([mode, data]) => {
                          if (!data) return null;
                          return (
                          <div key={mode} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                {mode === 'driving-car' && <Car className="h-5 w-5" />}
                                {mode === 'foot-walking' && <Footprints className="h-5 w-5" />}
                                {mode === 'cycling-regular' && <Bike className="h-5 w-5" />}
                              </div>
                              <span className="font-medium">
                                {mode === 'driving-car' ? 'Car' : 
                                 mode === 'foot-walking' ? 'Walk' : 
                                 mode === 'cycling-regular' ? 'Bike' : mode}
                              </span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {formatDistance(data.distance)} • {formatDuration(data.duration)}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.categories.map((category) => (
                          <span key={category} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Good For</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.goodFor.map((item) => (
                          <span key={item} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 