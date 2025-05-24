export type TransportMode = 'driving-car' | 'foot-walking' | 'cycling-regular';

export interface TransportationOption {
  mode: TransportMode;
  distance: number;
  duration: number;
  details?: string;
  cost?: number;
}