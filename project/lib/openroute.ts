import { toast } from "sonner";
import { TransportMode } from "@/types/transportation";

const ORS_API_KEY = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;  
const ORS_BASE_URL = "https://api.openrouteservice.org/v2";


interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResponse {
  features: Array<{
    properties: {
      segments: Array<{
        distance: number;
        duration: number;
      }>;
    };
  }>;
}

export interface RouteInfo {
  distance: number;
  duration: number;
}

export async function getRoute(
  start: Coordinates,
  end: Coordinates,
  mode: TransportMode = "driving-car"
): Promise<{ distance: number; duration: number } | null> {
  try {
    const response = await fetch(
      `${ORS_BASE_URL}/directions/${mode}?api_key=${ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch route");
    }

    const data: RouteResponse = await response.json();
    const segment = data.features[0]?.properties.segments[0];

    if (!segment) {
      throw new Error("No route found");
    }

    return {
      distance: segment.distance,
      duration: segment.duration,
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
}

export async function getAllTransportationOptions(
  start: Coordinates,
  end: Coordinates
): Promise<Record<TransportMode, { distance: number; duration: number } | null>> {
  const modes: TransportMode[] = ["driving-car", "cycling-regular", "foot-walking"];
  const results: Record<TransportMode, { distance: number; duration: number } | null> = {
    "driving-car": null,
    "cycling-regular": null,
    "foot-walking": null,
  };

  await Promise.all(
    modes.map(async (mode) => {
      try {
        const route = await getRoute(start, end, mode);
        results[mode] = route;
      } catch (error) {
        console.error(`Error fetching route for ${mode}:`, error);
        results[mode] = null;
      }
    })
  );

  return results;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
} 


// Function to determine the recommended transportation mode based on distance
export function getRecommendedMode(routes: Record<TransportMode, RouteInfo | null>): TransportMode | null {
  if (!routes) return null;
  
  // If walking distance is less than 2km, recommend walking
  if (routes["foot-walking"]?.distance && routes["foot-walking"].distance < 2000) {
    return "foot-walking";
  }
  
  // If cycling distance is less than 5km, recommend cycling
  if (routes["cycling-regular"]?.distance && routes["cycling-regular"].distance < 5000) {
    return "cycling-regular";
  }
  
  // For longer distances, recommend car
  return "driving-car";
}

// Map transportation mode to readable name
export function getTransportModeName(mode: TransportMode): string {
  switch (mode) {
    case "foot-walking":
      return "Walking";
    case "cycling-regular":
      return "Cycling";
    case "driving-car":
      return "Driving";
    default:
      return "Unknown";
  }
}