import { NextResponse } from 'next/server';

const OPENROUTE_API_KEY = '5b3ce3597851110001cf6248f4de9014855042b6b84ef75e5c9dc60e';
const OPENROUTE_BASE_URL = 'https://api.openrouteservice.org/v2/directions';

const PROFILE_MAP = {
  car: 'driving-car',
  bus: 'driving-hgv',
  walking: 'foot-walking',
  cycling: 'cycling-regular'
};

export async function POST(request: Request) {
  try {
    const { start, end, mode } = await request.json();

    if (!start || !end || !mode) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const profile = PROFILE_MAP[mode as keyof typeof PROFILE_MAP];
    if (!profile) {
      return NextResponse.json(
        { error: 'Invalid transportation mode' },
        { status: 400 }
      );
    }

    const url = `${OPENROUTE_BASE_URL}/${profile}?api_key=${OPENROUTE_API_KEY}`;
    const response = await fetch(url, {
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
    });

    if (!response.ok) {
      throw new Error(`OpenRouteService API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract relevant information
    const route = data.features[0];
    const distance = route.properties.segments[0].distance;
    const duration = route.properties.segments[0].duration;

    return NextResponse.json({
      distance: Math.round(distance / 1000), // Convert to kilometers
      duration: Math.round(duration / 60), // Convert to minutes
      mode
    });
  } catch (error) {
    console.error('Transportation API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transportation data' },
      { status: 500 }
    );
  }
} 