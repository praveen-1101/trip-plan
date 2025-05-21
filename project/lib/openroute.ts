const OPENROUTE_API_KEY = '5b3ce3597851110001cf6248f4de9014855042b6b84ef75e5c9dc60e';
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org/v2';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResponse {
  features: Array<{
    properties: {
      segments: Array<{
        duration: number;
        distance: number;
      }>;
    };
  }>;
}

const TRANSPORT_PROFILES = [
  { type: 'driving-car', name: 'Car', icon: '🚗' },
  { type: 'driving-hgv', name: 'Bus', icon: '🚌' },
  { type: 'foot-walking', name: 'Walking', icon: '🚶' },
  { type: 'cycling-regular', name: 'Bicycle', icon: '🚲' }
];

export async function getTransportationModes(start: Coordinates, end: Coordinates) {
  const results = await Promise.all(
    TRANSPORT_PROFILES.map(async (profile) => {
      try {
        const response = await fetch(
          `${OPENROUTE_BASE_URL}/directions/${profile.type}?api_key=${OPENROUTE_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            },
            body: JSON.stringify({
              coordinates: [
                [start.lng, start.lat],
                [end.lng, end.lat]
              ],
              format: 'json'
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${profile.name} route`);
        }

        const data: RouteResponse = await response.json();
        const segment = data.features[0]?.properties.segments[0];

        if (!segment) {
          throw new Error(`No route found for ${profile.name}`);
        }

        // Convert duration from seconds to minutes and distance from meters to kilometers
        const duration = Math.round(segment.duration / 60);
        const distance = (segment.distance / 1000).toFixed(1);

        return {
          name: profile.name,
          duration: `${duration} min`,
          distance: `${distance} km`,
          icon: profile.icon
        };
      } catch (error) {
        console.error(`Error fetching ${profile.name} route:`, error);
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

export async function getPublicTransport(
  start: Coordinates,
  end: Coordinates
): Promise<Array<{ mode: string; details: string; icon: string }>> {
  try {
    const response = await fetch(
      `${OPENROUTE_BASE_URL}/directions/public-transport?api_key=${OPENROUTE_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
      {
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch public transport routes');
    }

    const data = await response.json();
    const routes = data.features.map((feature: any) => {
      const segment = feature.properties.segments[0];
      const distance = (segment.distance / 1000).toFixed(1);
      const duration = Math.round(segment.duration / 60);

      return {
        mode: 'Public Transport',
        details: `${distance} km, ${duration} mins`,
        icon: 'bus',
        distance: parseFloat(distance),
        duration
      };
    });

    return routes;
  } catch (error) {
    console.error('Error fetching public transport routes:', error);
    return [];
  }
}

export async function getAllTransportationOptions(
  start: Coordinates,
  end: Coordinates
): Promise<Array<{ mode: string; details: string; icon: string }>> {
  const transportModes = await getTransportationModes(start, end);
  const publicTransport = await getPublicTransport(start, end);

  return [...transportModes, ...publicTransport].map(mode => ({
    mode: mode.name,
    details: `${mode.distance}, ${mode.duration}`,
    icon: mode.icon
  }));
} 