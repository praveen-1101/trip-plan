'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SearchFiltersProps {
  onSearch: (location: string) => void;
  initialLocation?: string;
  filters: {
    category: string;
    priceRange: number[];
    sortBy: string;
    transportationMode: string;
  };
  onFilterChange: (filters: any) => void;
}

export function SearchFilters({
  onSearch,
  initialLocation = '',
  filters,
  onFilterChange,
}: SearchFiltersProps) {
  const [location, setLocation] = useState(initialLocation);
  
  // Update location input when initialLocation prop changes
  useEffect(() => {
    if (initialLocation && initialLocation !== location) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="location"
              placeholder="City, landmark or region"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full mt-2">
          Search
        </Button>
      </form>
      
      <Accordion type="multiple" defaultValue={['category', 'sort', 'transport']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Categories</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-2">
              <Select 
                value={filters.category}
                onValueChange={(value) => onFilterChange({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="landmark">Landmarks</SelectItem>
                  <SelectItem value="museum">Museums & Galleries</SelectItem>
                  <SelectItem value="nature">Nature & Parks</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <span>Price Range</span>
            </div>
          </AccordionTrigger>
          {/* <AccordionContent>
            <div className="pt-4 px-2">
              <div className="mb-6">
                <Slider 
                  defaultValue={[0, 100]} 
                  max={100} 
                  step={1}
                  value={filters.priceRange}
                  onValueChange={(value) => {
                    if (Array.isArray(value) && value.length === 2) {
                      onFilterChange({ priceRange: value });
                    }
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
                <span>$100+</span>
              </div>
            </div>
          </AccordionContent> */}
        </AccordionItem>
        
        <AccordionItem value="sort">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <span>Sort By</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-2">
              <Select 
                value={filters.sortBy}
                onValueChange={(value) => onFilterChange({ sortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating (High to Low)</SelectItem>
                  <SelectItem value="distance">Distance (Near to Far)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="transport">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <span>Transportation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-2">
              <Select 
                value={filters.transportationMode}
                onValueChange={(value) => onFilterChange({ transportationMode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Transport mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Options</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="driving">Driving</SelectItem>
                  <SelectItem value="rideshare">Ride</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            <span>Best Time to Visit</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground mb-2">Current conditions for selected location:</p>
            <div className="font-medium">May - October</div>
            <p className="text-xs text-muted-foreground">
              Based on weather patterns, crowd levels, and local events. Visit during these months for the best experience.
            </p>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}