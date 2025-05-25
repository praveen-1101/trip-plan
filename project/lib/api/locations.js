'use client';

import { getTouristPlaces } from './places';
import { getWeatherData, getForecast } from './weather';
import { getRoute, formatDistance, formatDuration, RouteInfo, getAllTransportationOptions, getRecommendedMode, getTransportModeName } from '@/lib/openroute';
import {TransportMode} from '@/types/transportation';

const OPENROUTE_API_KEY = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;

export async function geocodeLocation(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent': 'TravelSage/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const results = await response.json();
    if (results.length === 0) {
      return null;
    }
    console.log(results[0].lat, results[0].lon);
    return {
      lat: parseFloat(results[0].lat),
      lon: parseFloat(results[0].lon),
      display_name: results[0].display_name
    };
  } catch (error) {
    console.error('Error geocoding location:', error);
    throw error;
  }
}

/* async function calculateDistance(fromLat, fromLon, toLat, toLon) {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?start=${fromLon},${fromLat}&end=${toLon},${toLat}`,
      {
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Route calculation failed');
    }

    const data = await response.json();
    const meters = data.features[0].properties.segments[0].distance;
    return `${(meters / 1000).toFixed(1)} km`;
  } catch (error) {
    console.error('Error calculating route distance:', error);
    const R = 6371; 
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLon = (toLon - fromLon) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return `${distance.toFixed(1)} km`;
  }
} */

export async function getAttractions(lat, lng, radius = 5000) {
  try {
    const userCoordinates = { lat, lng };

    const places = await getTouristPlaces(lat, lng);
    console.log("places", places);
    
    // Calculate distances and add weather data and transportationOptions
    const attractionsWithData = await Promise.all(places.map(async (place) => {
      try {

        /* const distance = await calculateDistance(lat, lon, place.coordinates.lat,place.coordinates.lng); */
        const [allRoutesRecord, placeWeather, placeForecast] = await Promise.all([
        getAllTransportationOptions(userCoordinates, place.coordinates),
        getWeatherData(place.coordinates.lat, place.coordinates.lng),
        getForecast(place.coordinates.lat, place.coordinates.lng),
        ]);

        
        const drivingRoute = allRoutesRecord['driving-car'];
        const distance = drivingRoute ? formatDistance(drivingRoute.distance) : null;
        
        const transportationOptions = Object.entries(allRoutesRecord)
            .filter(([, routeInfo]) => routeInfo && routeInfo.distance && routeInfo.duration)
            .map(([mode, routeInfo]) => ({
              mode: mode,
              distance: routeInfo.distance,
              duration: routeInfo.duration,
            }));
        return {
          ...place,
          distance,
          weather: {
            ...placeWeather,
          },
          forecast: placeForecast,
          transportOptions: transportationOptions
        };
      } catch (error) {
        console.error('Error processing attraction:', error);
        return {
          ...place,
          distance: null,
          transportOptions: [],
        }
      }
    }));
    
    return attractionsWithData;
  } catch (error) {
    console.error('Error fetching attractions:', error);
    throw error;
  }
}