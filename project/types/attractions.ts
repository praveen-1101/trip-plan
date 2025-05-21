import { WeatherData } from './weather';
import { TransportationMode } from './transportation';

export interface Attraction {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates:
  {
    lat: number;
    lng: number;
  };
  rating: number;
  reviews: number;
  images: string[];
  categories: string[];
  priceLevel: number;
  bestTimeToVisit: string;
  duration: string;
  goodFor: string[];
  crowdLevel: number; 
  distance: string;
  bestRoutes: string[];       
  transportOptions: TransportationMode[];
  weather?: WeatherData;
}