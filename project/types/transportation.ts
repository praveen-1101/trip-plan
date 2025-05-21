export interface TransportationMode 
{
    mode: 'car' | 'bus' | 'walking' | 'cycling';
    distance: number;
    duration: number;
    details?: string;
    cost?: number;
}