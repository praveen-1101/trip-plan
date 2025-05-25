'use client';

import { useState, useEffect } from 'react';
import { Attraction } from '@/types/attractions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Map, Calendar, Heart, Navigation, CloudSun, MapPin } from 'lucide-react';
import { AttractionDetailDialog } from '@/components/explore/attraction-detail-dialog';
import { Progress } from '@/components/ui/progress';
import { PlaceActions } from '@/components/places/place-actions';

interface Coordinates {
  lat: number;
  lng: number;
}

interface AttractionsListProps {
  attractions: Attraction[];
  userCoordinates: Coordinates | null;
}

export function AttractionsList({ attractions, userCoordinates }: AttractionsListProps) {
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  useEffect(() => {
    attractions.forEach((attraction) => {
      console.log("Attraction data being passed to PlaceActions:", {
        name: attraction.name,
        coordinates: attraction.coordinates,
        transportOptions: attraction.transportOptions
      });
    });
  }, [attractions]);

  useEffect(() => {
    if (attractions.length > 0) {
      const sample = attractions[0];
      console.log('Attraction sample data:', {
        id: sample.id,
        name: sample.name,
        location: sample.location,
        description: sample.description?.substring(0, 30) + '...',
        hasImages: sample.images?.length > 0,
        firstImageUrl: sample.images[0]?.substring(0, 30) + '...',
        weather: sample.weather,
        crowdLevel: sample.crowdLevel,
        bestRoutes: sample.bestRoutes,
        categories: sample.categories,
        goodFor: sample.goodFor,
        duration: sample.duration,
        distance: sample.distance,
        priceLevel: sample.priceLevel,
        rating: sample.rating,
        bestTimeToVisit: sample.bestTimeToVisit,
        images: sample.images,
        transportOptions: sample.transportOptions,
        userCoordinates: userCoordinates
      });
    }
  }, [attractions]);

  const handleOpenDetail = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setOpenDetailId(attraction.id);
  };

  return (
    <div className="space-y-6">
      {attractions.map((attraction) => (
        <Card key={attraction.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="h-48 md:h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${attraction.images[0]})`,
                backgroundColor: '#f3f4f6'
              }}
            />
            
            <div className="md:col-span-2 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="mb-1">{attraction.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Map className="h-3 w-3" />
                      <span>{attraction.location}</span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary font-semibold rounded-md py-1 px-2 flex items-center">
                      <Star className="h-4 w-4 fill-primary mr-1" />
                      <span>{attraction.rating}</span>
                    </div>
                    {attraction.weather?.main?.temp !== undefined && (
                      <div className="bg-accent/20 rounded-md p-2 flex items-center gap-2">
                        <CloudSun className="h-4 w-4" />
                        <span>{Math.round(attraction.weather.main.temp)}°C</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {attraction.description}
                </p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Best visit: {attraction.bestTimeToVisit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Duration: {attraction.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span>Distance: {attraction.distance}</span>
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
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {attraction.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="font-normal">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between items-center border-t">
                <div className="flex items-center gap-1 text-sm">
                  <div className="flex items-center mr-2">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Crowd Level:</span>
                  </div>
                  <div className="w-24 flex items-center gap-2">
                    <Progress value={attraction.crowdLevel * 20} className="h-2" />
                    <span className="text-xs font-medium">{
                      attraction.crowdLevel <= 1 ? "Low" : 
                      attraction.crowdLevel <= 3 ? "Moderate" : 
                      "High"
                    }</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
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
                    transportOptions={attraction.transportOptions}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenDetail(attraction)}
                  >
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
      
      {selectedAttraction && (
        <AttractionDetailDialog
          attraction={selectedAttraction}
          open={!!openDetailId}
          onOpenChange={(open) => {
            if (!open) setOpenDetailId(null);
          }}
          userLocation = {userCoordinates}
        />
      )}
    </div>
  );
}