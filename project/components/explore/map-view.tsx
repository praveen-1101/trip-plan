'use client';

import { useState, useEffect } from 'react';
import { Attraction } from '@/types/attractions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Info } from 'lucide-react';
import { AttractionDetailDialog } from '@/components/explore/attraction-detail-dialog';

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapViewProps {
  attractions: Attraction[];
  userCoordinates: Coordinates | null;
}

export function MapView({ attractions, userCoordinates }: MapViewProps) {
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  const handleSelectAttraction = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
  };
  
  const handleOpenDetail = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setOpenDetailId(attraction.id);
  };

  return (
    <div className="flex flex-col h-[700px]">
      <Card className="flex-grow relative border">
        <CardContent className="p-0 h-full relative">
          <div 
            className="w-full h-full bg-accent/10 flex items-center justify-center relative"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/4386429/pexels-photo-4386429.jpeg?auto=compress&cs=tinysrgb&h=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm"></div>
            
            <div className="absolute inset-0 z-10">
              {attractions.map((attraction, index) => {
                const top = 20 + (index * 15) % 60;
                const left = 25 + (index * 20) % 60;
                
                return (
                  <div 
                    key={attraction.id}
                    className="absolute"
                    style={{ top: `${top}%`, left: `${left}%` }}
                  >
                    <button
                      className={`group flex items-center justify-center w-10 h-10 rounded-full ${
                        selectedAttraction?.id === attraction.id 
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-primary hover:bg-primary/20'
                      } transition-colors shadow-md`}
                      onClick={() => handleSelectAttraction(attraction)}
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                    
                    {selectedAttraction?.id === attraction.id && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-20 w-64">
                        <Card className="overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div 
                            className="h-20 bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${attraction.images[0]})`,
                              backgroundColor: '#f3f4f6'
                            }}
                          />
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm">{attraction.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{attraction.location}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="text-xs bg-primary/10 text-primary font-medium rounded-sm py-0.5 px-1 flex items-center">
                                  <span>{attraction.rating}</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleOpenDetail(attraction)}>
                                <Info className="h-3 w-3 mr-1" />
                                <span>Details</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="relative z-0 text-center p-6 rounded-lg bg-background/50 backdrop-blur-md max-w-md">
              <h3 className="text-xl font-bold mb-2">Interactive Map Coming Soon</h3>
              <p className="text-muted-foreground">
                In the final implementation, this will be integrated with Google Maps or Mapbox to show real attractions, routes, and navigation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedAttraction && (
        <AttractionDetailDialog
          attraction={selectedAttraction}
          open={!!openDetailId}
          onOpenChange={(open) => {
            if (!open) setOpenDetailId(null);
          }}
          userCoordinates={userCoordinates}
        />
      )}
    </div>
  );
}