'use client';

import { Attraction } from '@/types/attractions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Droplets, 
  Sun, 
  Thermometer, 
  Bus, 
  Car, 
  Train,
  Footprints,
  Heart,
  Share2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { WeatherChart } from '@/components/explore/weather-chart';
import { PlaceActions } from '@/components/places/place-actions';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AttractionDetailDialogProps {
  attraction: Attraction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttractionDetailDialog({
  attraction,
  open,
  onOpenChange,
}: AttractionDetailDialogProps) {
  
  // Log attraction data when dialog opens
  useEffect(() => {
    if (open) {
      console.log('Attraction detail data:', {
        id: attraction.id,
        name: attraction.name,
        location: attraction.location,
        description: attraction.description?.substring(0, 30) + '...',
        hasImages: attraction.images?.length > 0,
        firstImageUrl: attraction.images[0]?.substring(0, 30) + '...',
      });
    }
  }, [open, attraction]);
  
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
                    <div className="flex items-center gap-2 text-sm">
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
                    </div>
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
                    
                   {/*  <div className="grid grid-cols-2 gap-4 mb-4">
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                          <Users className="h-8 w-8 mb-2 text-primary" />
                          <h4 className="text-sm font-semibold text-center">Lowest Crowds</h4>
                          <p className="text-xs text-center text-muted-foreground">Weekday mornings, off-season</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                          <Sun className="h-8 w-8 mb-2 text-primary" />
                          <h4 className="text-sm font-semibold text-center">Best Weather</h4>
                          <p className="text-xs text-center text-muted-foreground">April to June, September</p>
                        </CardContent>
                      </Card>
                    </div> */}

                  </div>
                </TabsContent>
                
                <TabsContent value="routes" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Getting There</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Multiple transportation options available to reach {attraction.name}.
                    </p>
                    
                    <div className="space-y-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Footprints className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="text-sm font-semibold">Walking</h4>
                              <p className="text-xs text-muted-foreground">15 min (0.8 miles)</p>
                            </div>
                            <Badge className="ml-auto">Recommended</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Bus className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="text-sm font-semibold">Public Transit</h4>
                              <p className="text-xs text-muted-foreground">25 min (Bus #42, every 10 min)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Car className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="text-sm font-semibold">Ding</h4>
                              <p className="text-xs text-muted-foreground">10 min (2.1 miles), Parking: $10/day</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Train className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="text-sm font-semibold">Train + Walking</h4>
                              <p className="text-xs text-muted-foreground">20 min (Metro Line B to Central Station + 5 min walk)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
            
            <div className="p-4 border-t">
              {/* Removed redundant action buttons since PlaceActions component already handles these functions */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}