'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFilters } from '@/components/explore/search-filters';
import { AttractionsList } from '@/components/explore/attractions-list';
/* import { MapView } from '@/components/explore/map-view'; */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapIcon, ListIcon, Loader2, CloudSun } from 'lucide-react';
import { Attraction } from '@/types/attractions';
import { geocodeLocation, getAttractions } from '@/lib/api/locations';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Storage keys for localStorage
const STORAGE_KEY_LOCATION = 'explore-location';
const STORAGE_KEY_ATTRACTIONS = 'explore-attractions';
const STORAGE_KEY_WEATHER = 'explore-weather';
const STORAGE_KEY_FILTERS = 'explore-filters';
const STORAGE_KEY_VIEW = 'explore-view';

interface Coordinates {
  lat: number;
  lng: number; // Using lng for consistency with your ORS calls, though 'lon' might be used internally in geocoding
}

export function ExploreContainer() {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location');
  
  // Initialize state from localStorage or default values
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 100],
    sortBy: 'popularity',
    transportationMode: 'all',
  });

  // Load saved state from localStorage on component mount
  useEffect(() => {
    // Only run in client-side
    if (typeof window !== 'undefined') {
      try {
        // Load location
        const savedLocation = localStorage.getItem(STORAGE_KEY_LOCATION);
        if (savedLocation) {
          setLocation(savedLocation);
        }

        // Load attractions
        const savedAttractions = localStorage.getItem(STORAGE_KEY_ATTRACTIONS);
        if (savedAttractions) {
          setAttractions(JSON.parse(savedAttractions));
        }

        // Load weather
        const savedWeather = localStorage.getItem(STORAGE_KEY_WEATHER);
        if (savedWeather) {
          setCurrentWeather(JSON.parse(savedWeather));
        }

        // Load filters
        const savedFilters = localStorage.getItem(STORAGE_KEY_FILTERS);
        if (savedFilters) {
          setFilters(JSON.parse(savedFilters));
        }

        // Load view preference
        const savedView = localStorage.getItem(STORAGE_KEY_VIEW);
        if (savedView && (savedView === 'list' || savedView === 'map')) {
          setActiveView(savedView);
        }
      } catch (error) {
        console.error('Error loading saved explore state:', error);
        // If there's an error parsing saved data, we'll just use the defaults
      }
    }
  }, []);

  // Use location param if provided (overrides localStorage)
  useEffect(() => {
    if (locationParam) {
      searchLocation(locationParam);
    }
  }, [locationParam]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && location) {
      localStorage.setItem(STORAGE_KEY_LOCATION, location);
    }
  }, [location]);

  useEffect(() => {
    if (typeof window !== 'undefined' && attractions.length > 0) {
      localStorage.setItem(STORAGE_KEY_ATTRACTIONS, JSON.stringify(attractions));
    }
  }, [attractions]);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentWeather) {
      localStorage.setItem(STORAGE_KEY_WEATHER, JSON.stringify(currentWeather));
    }
  }, [currentWeather]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
    }
  }, [filters]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VIEW, activeView);
    }
  }, [activeView]);

  const searchLocation = async (searchTerm: string) => {
    setIsLoading(true);
    setLocation(searchTerm);
    
    try {
      const geoResult = await geocodeLocation(searchTerm);
      if (!geoResult) {
        throw new Error('Location not found');
      }
      
      setUserCoordinates({ lat: geoResult.lat, lng: geoResult.lon });

      const results = await getAttractions(geoResult.lat, geoResult.lon);
      setAttractions(results);

      console.log("working explore:", results);
      
      if (results.length > 0 && results[0].weather) {
        setCurrentWeather(results[0].weather);
      }
    } catch (error) {
      console.error('Error searching for attractions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleViewChange = (view: 'list' | 'map') => {
    setActiveView(view);
  };

  return (
    <section className="flex-grow pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {location ? `Exploring ${location}` : 'Find Your Next Adventure'}
              </h1>
              <p className="text-muted-foreground">
                {attractions.length > 0 
                  ? `Discovered ${attractions.length} amazing places to visit`
                  : 'Search for a location to discover attractions'}
              </p>
            </div>
            
            {currentWeather?.main?.temp && currentWeather?.weather?.[0] && (
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <CloudSun className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-semibold">
                      {Math.round(currentWeather.main.temp)}°C
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {currentWeather.weather[0].description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <SearchFilters 
              onSearch={searchLocation} 
              initialLocation={location}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
          
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="flex items-center justify-center h-96 bg-card rounded-lg border border-border">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-lg">Discovering amazing places in {location}...</p>
                </div>
              </div>
            ) : attractions.length > 0 ? (
              <Tabs defaultValue={activeView} className="w-full" onValueChange={(value) => handleViewChange(value as 'list' | 'map')}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {attractions.length} Attractions Found
                  </h2>
                  <TabsList>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <ListIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">List View</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="list" className="mt-0">
                  <AttractionsList attractions={attractions} userCoordinates={userCoordinates}/>
                </TabsContent>
                
                {/* <TabsContent value="map" className="mt-0">
                  <MapView attractions={attractions} />
                </TabsContent> */}
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-96 bg-card rounded-lg border border-border">
                <div className="text-center max-w-md">
                  <MapIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Attractions Found</h3>
                  <p className="text-muted-foreground">
                    Search for a location to discover amazing tourist attractions, optimized travel routes, and the best times to visit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}