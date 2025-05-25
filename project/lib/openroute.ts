import { toast } from "sonner";
import { TransportMode } from "@/types/transportation";

const ORS_API_KEY = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;  
const ORS_BASE_URL = "https://api.openrouteservice.org/v2";


interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResponse {
  routes: Array<{
    summary: {
      distance: number;
      duration: number;
    };
    segments: Array<{
      distance: number;
      duration: number;
      steps: Array<any>;
    }>;
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
  console.log(`[ORS] Fetching route for mode: ${mode} from ${start.lng},${start.lat} to ${end.lng},${end.lat}`);

  if (!ORS_API_KEY) {
    console.error("ORS_API_KEY is not defined.");
    return null;
  }

  try {
    const response = await fetch(`${ORS_BASE_URL}/directions/${mode}`,
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/geo+json",
          Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        },
        method: "POST",
        body: JSON.stringify({
          coordinates: [
            [start.lng, start.lat],
            [end.lng, end.lat],
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ORS ERROR] Mode: ${mode}, Status: ${response.status}, Details: ${errorBody.substring(0, 500)}`);
      throw new Error(`Failed to fetch route: ${response.status} ${errorBody}`);
    }

    const data: RouteResponse = await response.json();
    const segment = data.routes?.[0]?.segments?.[0];

    if (!segment) {
      console.error(`[ORS ERROR] No route found for mode: ${mode}`);
      throw new Error("No route found");
    }

    console.log(`[ORS] Route found for mode: ${mode}, Distance: ${segment.distance}, Duration: ${segment.duration}`);

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