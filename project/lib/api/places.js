'use client';

const FOURSQUARE_API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY;
const OPENTRIPMAP_API_KEY = process.env.NEXT_PUBLIC_OPENTRIPMAP_API_KEY;
const OPENROUTE_API_KEY = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;

export async function getTouristPlaces(lat, lon, radius = 5000, category = 'all') {
  try {
    const openTripResponse = await fetch(
      `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=${category === 'all' ? 'interesting_places' : category}&format=json&apikey=${OPENTRIPMAP_API_KEY}&limit=50&lang=en`
    );
    
    let places = [];
    let otmPlaces = new Map();
    
    if (openTripResponse.ok) {
      const openTripData = await openTripResponse.json();
      
      const startIndex = Math.floor(Math.random() * Math.max(0, openTripData.length - 10));
      const selectedPlaces = openTripData.slice(startIndex, startIndex + 5);
      
      for (const place of selectedPlaces) {
        const detailResponse = await fetch(
          `https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${OPENTRIPMAP_API_KEY}&lang=en`
        );
        
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          otmPlaces.set(detail.name?.toLowerCase(), {
            description: detail.wikipedia_extracts?.text || detail.info?.descr,
            categories: detail.kinds?.split(',').map(k => k.replace(/_/g, ' ')) || [],
            originalName: detail.name,
            translatedName: detail.name_suffix || detail.name ,
            lat: detail.point?.lat, 
            lon: detail.point?.lon
          });
        }
      }
    }

    const fsResponse = await fetch(
      `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&radius=${radius}&categories=${category === 'all' ? '16000' : category}&limit=40`,
      {
        headers: {
          'Authorization': FOURSQUARE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (fsResponse.ok) {
      const fsData = await fsResponse.json();
      
      const startIndex = Math.floor(Math.random() * Math.max(0, fsData.results.length - 10));
      const selectedPlaces = fsData.results.slice(startIndex, startIndex + 5);
      
      places = await Promise.all(selectedPlaces.map(async (place) => {
        const photos = await getPlacePhotos(place.fsq_id, place.name, place.location.formatted_address);
        const categories = place.categories.map(c => c.name);
        const rating = place.rating || parseFloat((Math.random() * 2 + 3).toFixed(1));
        const priceLevel = place.price || Math.floor(Math.random() * 3) + 1;
        const crowdData = await getCrowdData(place.fsq_id, categories);
        const duration = estimateDuration(categories, rating);
        
        
        const otmData = otmPlaces.get(place.name.toLowerCase());
        const description = otmData?.description || 
          `Discover ${place.name}, a notable ${categories[0]?.toLowerCase() || 'destination'} in ${place.location.formatted_address}. ` +
          `This location is particularly known for ${categories.map(c => c.toLowerCase()).join(', ')}.`;
        
        let displayName = place.name;
        if (otmData?.originalName && otmData?.translatedName && otmData.originalName !== otmData.translatedName) {
          displayName = `${otmData.translatedName} (${otmData.originalName})`;
        }
        
        const allCategories = [...new Set([
          ...categories,
          ...(otmData?.categories || [])
        ])];
        
        return {
          id: place.fsq_id,
          name: displayName,
          location: place.location.formatted_address,
          coordinates: {
            lat: otmData?.lat || place.geocodes.main.latitude,
            lng: otmData?.lon || place.geocodes.main.longitude
          },
          description,
          rating,
          reviews: place.stats?.total_ratings || Math.floor(Math.random() * 1000 + 100),
          images: photos,
          categories: allCategories,
          priceLevel,
          bestTimeToVisit: crowdData.bestTimeToVisit,
          duration,
          goodFor: ['Sightseeing', 'Photography', 'Culture'],
          crowdLevel: crowdData.crowdLevel,
          distance: '0 km',
          /* transportOptions: ['Walking', 'Public Transit', 'Driving']  */
        };
      }));
    }

    places = await Promise.all(places.map(async (place) => {
      console.log("Foursquare place data:", place);
      const distance = await calculateDistance(lat, lon, place.coordinates.lat, place.coordinates.lng);
      return {
        ...place,
        distance
      };
    }));
   console.log("places after fetching", places);
    return places.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error fetching tourist places:', error);
    return [];
  }
}

export async function getPlaceDetails(placeId) {
  try {
    const response = await fetch(
      `https://api.foursquare.com/v3/places/${placeId}`,
      {
        headers: {
          'Authorization': FOURSQUARE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
}

export async function getPlacePhotos(placeId, name, location) {
  try {
    const response = await fetch(
      `https://api.foursquare.com/v3/places/${placeId}/photos`,
      {
        headers: {
          'Authorization': FOURSQUARE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        return data.map(photo => `${photo.prefix}original${photo.suffix}`);
      }
    }
    
    const searchResponse = await fetch(
      `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(`${name} ${location}`)}&limit=1`,
      {
        headers: {
          'Authorization': FOURSQUARE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.results?.length > 0) {
        const newPlaceId = searchData.results[0].fsq_id;
        const photoResponse = await fetch(
          `https://api.foursquare.com/v3/places/${newPlaceId}/photos`,
          {
            headers: {
              'Authorization': FOURSQUARE_API_KEY,
              'Accept': 'application/json'
            }
          }
        );
        
        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          if (photoData.length > 0) {
            return photoData.map(photo => `${photo.prefix}original${photo.suffix}`);
          }
        }
      }
    }
    
    return ['https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&h=650'];
  } catch (error) {
    console.error('Error fetching place photos:', error);
    return ['https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&h=650'];
  }
}

export async function getPlaceReviews(placeId) {
  try {
    const response = await fetch(
      `https://api.foursquare.com/v3/places/${placeId}/tips`,
      {
        headers: {
          'Authorization': FOURSQUARE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching place reviews:', error);
    return [];
  }
}

export async function getCrowdData(placeId, categories = []) {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Base crowd patterns for different place types
  const patterns = {
    museum: {
      peakHours: [11, 12, 13, 14, 15],
      weekendMultiplier: 1.4,
      baseLevel: 50
    },
    park: {
      peakHours: [10, 11, 16, 17, 18],
      weekendMultiplier: 1.6,
      baseLevel: 40
    },
    restaurant: {
      peakHours: [12, 13, 19, 20],
      weekendMultiplier: 1.3,
      baseLevel: 60
    },
    shopping: {
      peakHours: [14, 15, 16, 17, 18],
      weekendMultiplier: 1.5,
      baseLevel: 55
    },
    landmark: {
      peakHours: [10, 11, 12, 13, 14, 15],
      weekendMultiplier: 1.3,
      baseLevel: 65
    },
    default: {
      peakHours: [11, 12, 13, 14, 15, 16],
      weekendMultiplier: 1.2,
      baseLevel: 45
    }
  };

  // Determine place type from categories
  let placeType = 'default';
  if (categories.some(c => c.toLowerCase().includes('museum') || c.toLowerCase().includes('gallery'))) {
    placeType = 'museum';
  } else if (categories.some(c => c.toLowerCase().includes('park') || c.toLowerCase().includes('garden'))) {
    placeType = 'park';
  } else if (categories.some(c => c.toLowerCase().includes('restaurant') || c.toLowerCase().includes('cafe'))) {
    placeType = 'restaurant';
  } else if (categories.some(c => c.toLowerCase().includes('shop') || c.toLowerCase().includes('mall'))) {
    placeType = 'shopping';
  } else if (categories.some(c => c.toLowerCase().includes('landmark') || c.toLowerCase().includes('monument'))) {
    placeType = 'landmark';
  }

  const pattern = patterns[placeType];

  // Calculate base crowd level
  let crowdLevel = pattern.baseLevel;

  // Adjust for time of day
  const isOpeningHour = hour === 9 || hour === 10;
  const isClosingHour = hour === 17 || hour === 18;
  const isPeakHour = pattern.peakHours.includes(hour);

  if (isOpeningHour) crowdLevel *= 0.7;
  if (isClosingHour) crowdLevel *= 0.5;
  if (isPeakHour) crowdLevel *= 1.4;

  // Adjust for day of week
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) {
    crowdLevel *= pattern.weekendMultiplier;
  }

  // Add some randomness (±15%)
  const randomFactor = 0.85 + (Math.random() * 0.3);
  crowdLevel *= randomFactor;

  // Ensure crowd level stays within bounds (0-100)
  crowdLevel = Math.min(Math.max(Math.round(crowdLevel), 0), 100);

  // Generate hourly forecast for the day
  const hourlyForecast = Array.from({ length: 24 }, (_, i) => {
    let hourCrowd = pattern.baseLevel;
    
    // Early morning and late night have very low crowds
    if (i < 6 || i > 22) {
      hourCrowd *= 0.2;
    } else if (pattern.peakHours.includes(i)) {
      hourCrowd *= 1.4;
    }

    if (isWeekend) {
      hourCrowd *= pattern.weekendMultiplier;
    }

    // Add slight randomness
    hourCrowd *= (0.9 + (Math.random() * 0.2));
    hourCrowd = Math.min(Math.max(Math.round(hourCrowd), 0), 100);

    return hourCrowd;
  });

  return {
    crowdLevel: Math.ceil(crowdLevel / 20), // Convert to 1-5 scale
    hourlyForecast,
    bestTimeToVisit: getBestTimeToVisit(hourlyForecast, placeType)
  };
}

function getBestTimeToVisit(hourlyForecast, placeType) {
  // Find the least crowded period during operating hours (9 AM - 6 PM)
  const operatingHours = hourlyForecast.slice(9, 19);
  const minCrowd = Math.min(...operatingHours);
  const bestHour = operatingHours.indexOf(minCrowd) + 9;

  if (bestHour < 11) return 'Early Morning (9-11 AM)';
  if (bestHour < 14) return 'Late Morning (11 AM-2 PM)';
  if (bestHour < 16) return 'Afternoon (2-4 PM)';
  return 'Late Afternoon (4-6 PM)';
}

async function calculateDistance(fromLat, fromLon, toLat, toLon) {
  // Calculate straight-line distance first as a fallback
  const R = 6371; // Earth's radius in km
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLon = (toLon - fromLon) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const straightLineDistance = R * c;

  try {
    // Try to get the driving distance from OpenRouteService
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?start=${fromLon},${fromLat}&end=${toLon},${toLat}`,
      {
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Route calculation failed');
    }

    const data = await response.json();
    const meters = data.features[0].properties.segments[0].distance;
    return `${(meters / 1000).toFixed(1)} km`;
  } catch (error) {
    // If the API call fails, return the straight-line distance
    return `${straightLineDistance.toFixed(1)} km`;
  }
}

function estimateDuration(categories, rating) {
  if (categories.some(c => c.includes('museum') || c.includes('gallery'))) {
    return '2-4 hours';
  } else if (categories.some(c => c.includes('park') || c.includes('nature'))) {
    return '1-3 hours';
  } else if (categories.some(c => c.includes('temple') || c.includes('church'))) {
    return '30-45 minutes';
  } else if (categories.some(c => c.includes('restaurant') || c.includes('cafe'))) {
    return '1-2 hours';
  } else if (categories.some(c => c.includes('shopping'))) {
    return '2-3 hours';
  } else if (rating > 4.5) {
    return '2-3 hours';
  } else if (rating > 4.0) {
    return '1-2 hours';
  }
  return '45-90 minutes';
}
