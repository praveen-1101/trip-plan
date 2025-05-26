'use client';

import { Attraction } from '@/types/attractions';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransportationOption, TransportMode } from '@/types/transportation';
import { Progress } from '@/components/ui/progress';
import { WeatherChart } from '@/components/explore/weather-chart';
import { PlaceActions } from '@/components/places/place-actions';
import { useEffect, useState, useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Thermometer,
  Car, 
  Footprints,
  Bike,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import {
 formatDistance, 
 formatDuration, 
 RouteInfo, 
 getAllTransportationOptions, 
 getRecommendedMode, 
 getTransportModeName 
} from '@/lib/openroute';

interface Coordinates {
  lat: number;
  lng: number;
}

interface AttractionDetailDialogProps {
  attraction: Attraction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLocation: Coordinates | null;
}

export function AttractionDetailDialog({
  attraction,
  open,
  onOpenChange,
  userLocation
}: AttractionDetailDialogProps) {

   const [transportData, setTransportData] = useState<Record<TransportMode, RouteInfo | null> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 /*  const [recommendedMode, setRecommendedMode] = useState<TransportMode | null>(null);
   */
  useEffect(() => {
    if (open) {
      console.log('Attraction detail data:', {
        id: attraction.id,
        name: attraction.name,
        location: attraction.location,
        description: attraction.description?.substring(0, 30) + '...',
        hasImages: attraction.images?.length > 0,
        firstImageUrl: attraction.images[0]?.substring(0, 30) + '...',
        transportOptions: attraction.transportOptions
      });
    }
  }, [open, attraction]);

   useEffect(() => {
    async function fetchRoutes() {
      if(!open || !userLocation) {
        setTransportData(null);
       /*  setRecommendedMode(null); */
        setLoading(false);  
        setError(null);
        return;
      }

      const storageKey = `transportData_${attraction.id}_${userLocation.lat}_${userLocation.lng}`; // Unique key including user location
      let dataLoadedFromStorage = false;

      if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
        try {
          const storedData = JSON.parse(localStorage.getItem(storageKey)!);
          setTransportData(storedData);
          setLoading(false); // No need to show loading if data is instantly available
          console.log('Loaded transportation data from localStorage for', attraction.name);
          dataLoadedFromStorage = true;
        } catch (e) {
          console.error('Failed to parse stored transport data, clearing it:', e);
          localStorage.removeItem(storageKey); // Clear corrupted data
        }
      }
      if (!dataLoadedFromStorage) {
      setLoading(true);
      setError(null);
      setTransportData(null);

      try {
        // Call the new getAllTransportationOptions function
        const fetchedData = await getAllTransportationOptions(userLocation, attraction.coordinates);
        setTransportData(fetchedData); // Store the entire record
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(fetchedData)); // Store the fetched data
          console.log('Fetched and stored new transportation data for', attraction.name);
        }
        // Determine the recommended mode based on the fetched data
      /*   setRecommendedMode(getRecommendedMode(fetchedData)); */

      } catch (err) {
        console.error('Failed to fetch routes:', err);
        setError('Failed to load transportation options');
      } finally {
        setLoading(false);
      }
    }
    }
    fetchRoutes();
  }, [open, userLocation,attraction.coordinates, attraction.id]);
  // Transform attraction.transportOptions (array) into a Record<TransportMode, RouteInfo | null>
  // for compatibility with getRecommendedMode. Use useMemo to re-calculate only if attraction.transportOptions changes.

  // Determine the recommended mode based on the pre-fetched data
  const recommendedMode = useMemo(() => {
    // Only calculate if transportData is available
    if (transportData) {
      return getRecommendedMode(transportData);
    }
    return null; // No recommended mode if data isn't loaded
  }, [transportData]);

  // Helper function to get the icon based on the TransportMode string
  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'foot-walking':
        return <Footprints className="h-5 w-5 text-primary" />;
      case 'cycling-regular':
        return <Bike className="h-5 w-5 text-primary" />;
      case 'driving-car':
        return <Car className="h-5 w-5 text-primary" />;
      default:
        return <ArrowRight className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh]">
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          <div className="md:col-span-3 relative">
            <div 
              className="h-48 md:h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${attraction.images[0]})`,
                backgroundColor: '#f3f4f6'
              }}
            />
            
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{attraction.name}</h2>
                  <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{attraction.location}</span>
                  <div className="ml-auto bg-white text-primary font-semibold rounded-md py-1 px-2 flex items-center">
                    <Star className="h-4 w-4 fill-primary mr-1" />
                    <span>{attraction.rating}</span>
                  </div>
                </div>
              </div>
                <PlaceActions
                  placeId={attraction.id}
                  placeName={attraction.name}
                  placeDescription={attraction.description}
                  placeLocation={attraction.location}
                  placeImage={attraction.images[0] || ''}
                  placeUrl={`${window.location.origin}/places/${attraction.id}`}
                  rating={attraction.rating}
                  bestTimeToVisit={attraction.bestTimeToVisit}
                  duration={attraction.duration}
                  distance={attraction.distance}
                  priceLevel={attraction.priceLevel}
                  categories={attraction.categories}
                  goodFor={attraction.goodFor}  
                  temperature={attraction.weather?.main?.temp || 0}
                  crowdLevel={attraction.crowdLevel.toString()}
                  bestRoutes={attraction.bestRoutes}
                  coordinates={attraction.coordinates}
                  transportOptions={transportData ? Object.entries(transportData).map(([mode, data]) => ({
                    mode: mode as TransportMode,
                    distance: data?.distance || 0,
                    duration: data?.duration || 0
                  })) : []}
                />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-2">
              <div className="flex justify-between">
                <DialogTitle>Attraction Details</DialogTitle>
              </div>
              <DialogDescription>
                Plan your visit to {attraction.name}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-grow px-6 py-2">
              <Tabs defaultValue="details">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="timing" className="flex-1">Best Time</TabsTrigger>
                  <TabsTrigger value="routes" className="flex-1">Routes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {attraction.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Best visit: {attraction.bestTimeToVisit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {attraction.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Good for: {attraction.goodFor.join(', ')}</span>
                    </div>
                    {/* <div className="flex items-center gap-2 text-sm">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span 
                            key={i} 
                            className={`w-4 h-4 text-xs flex items-center justify-center ${
                              i < attraction.priceLevel 
                                ? "text-primary" 
                                : "text-muted-foreground/30"
                            }`}
                          >
                            $
                          </span>
                        ))}
                      </div>
                      <span className="text-muted-foreground text-xs">Price Level</span>
                    </div> */}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {attraction.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="font-normal">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Crowd Level</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={attraction.crowdLevel * 20} className="h-2 flex-grow" />
                      <span className="text-sm">{
                        attraction.crowdLevel <= 1 ? "Low" : 
                        attraction.crowdLevel <= 3 ? "Moderate" : 
                        "High"
                      }</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timing" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Weather Forecast</h3>
                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          {attraction.weather?.main?.temp !== undefined && (
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-lg font-semibold">
                                  {Math.round(attraction.weather.main.temp)}°C
                                </p>
                                {attraction.weather.weather?.[0]?.description && (
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {attraction.weather.weather[0].description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold mb-3">5-Day Forecast</h4>
                        <WeatherChart 
                          lat={attraction.coordinates.lat} 
                          lon={attraction.coordinates.lng}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* <TabsContent value="routes" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Getting There</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Transportation options available to reach {attraction.name} from your current location.
                    </p>
                
                    {loading ? ( 
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full animate-pulse">
                                                  <div className="h-5 w-5" /> 
                                </div>
                                <div className="flex-grow">
                                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" /> 
                                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" /> 
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : error ? ( 
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-red-500 text-center">{error}</p>
                        </CardContent>
                      </Card>
                    ) : ( 
                      <div className="space-y-3">
                        {transportData && Object.keys(transportData).length > 0 ? (
                          (Object.keys(transportData) as TransportMode[]).map((mode) => {
                            const route = transportData[mode];
                            if (route) {
                              return (
                                <Card key={mode}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-primary/10 p-2 rounded-full">
                                        {getTransportIcon(mode)}
                                      </div>
                                      <div className="flex-grow">
                                        <h4 className="text-sm font-semibold">{getTransportModeName(mode)}</h4>
                                        <p className="text-xs text-muted-foreground">
                                          {formatDuration(route.duration)} ({formatDistance(route.distance)})
                                        </p>
                                      </div>
                                      {mode === recommendedMode && (
                                        <Badge className="ml-auto">Recommended</Badge>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }
                            return null;
                          })
                        ) : ( 
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground text-center">
                                No transportation routes found for this attraction from your location.
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent> */}
                
                <TabsContent value="routes" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Getting There</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Transportation options available to reach {attraction.name} from your current location.
                    </p>

                    {loading ? (
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[100px]">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                          <p className="text-sm text-muted-foreground text-center">
                            Loading transportation options...
                          </p>
                        </CardContent>
                      </Card>
                    ) : error ? (
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-red-500 text-center">{error}</p>
                        </CardContent>
                      </Card>
                    ) : transportData && Object.keys(transportData).length > 0 ? (
                      <div className="space-y-3">
                        {(Object.keys(transportData) as TransportMode[]).map((mode) => {
                          const route = transportData[mode];
                          if (route) {
                            return (
                              <Card key={mode}>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                      {getTransportIcon(mode)}
                                    </div>
                                    <div className="flex-grow">
                                      <h4 className="text-sm font-semibold">{getTransportModeName(mode)}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDuration(route.duration)} ({formatDistance(route.distance)})
                                      </p>
                                    </div>
                                    {mode === recommendedMode && (
                                      <Badge className="ml-auto">Recommended</Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground text-center">
                            No transportation routes found for this attraction from your location.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

              </Tabs>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}