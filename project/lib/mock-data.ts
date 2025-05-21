import { Attraction } from '@/types/attractions';

// This file contains mock data for development purposes
// In a production app, this would be replaced with API calls

const attractions: Attraction[] = [
  {
    id: '1',
    name: 'Eiffel Tower',
    description: 'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower. Locally nicknamed "La dame de fer", it has become a global cultural icon of France.',
    location: 'Paris, France',
    coordinates: { lat: 48.8584, lng: 2.2945 },
    rating: 4.7,
    reviews: 215430,
    images: [
      'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&h=800',
      'https://images.pexels.com/photos/534283/pexels-photo-534283.jpeg?auto=compress&cs=tinysrgb&h=800'
    ],
    categories: ['Landmark', 'Historical', 'Architecture'],
    priceLevel: 2,
    bestTimeToVisit: 'Early morning or evening',
    duration: '1-2 hours',
    goodFor: ['Couples', 'Photography', 'First-time visitors'],
    crowdLevel: 4,
    distance: '1.2 miles',
    transportOptions: ['Walking', 'Metro', 'Bus']
  },
  {
    id: '2',
    name: 'Louvre Museum',
    description: 'The Louvre Museum is the world\'s largest art museum and a historic monument in Paris, France. A central landmark of the city, it is located on the Right Bank of the Seine. Approximately 38,000 objects from prehistory to the 21st century are exhibited over an area of 72,735 square meters.',
    location: 'Paris, France',
    coordinates: { lat: 48.8606, lng: 2.3376 },
    rating: 4.8,
    reviews: 189654,
    images: [
      'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&h=800',
      'https://images.pexels.com/photos/2675268/pexels-photo-2675268.jpeg?auto=compress&cs=tinysrgb&h=800'
    ],
    categories: ['Museum', 'Art', 'Historical'],
    priceLevel: 2,
    bestTimeToVisit: 'Weekday afternoons',
    duration: '3-4 hours',
    goodFor: ['Art lovers', 'History buffs', 'Cultural experience'],
    crowdLevel: 3,
    distance: '0.8 miles',
    transportOptions: ['Walking', 'Metro', 'Bus']
  },
  {
    id: '3',
    name: 'Notre-Dame Cathedral',
    description: 'Notre-Dame de Paris, also known as Notre-Dame Cathedral, is a medieval Catholic cathedral on the Île de la Cité in the 4th arrondissement of Paris. The cathedral is widely considered to be one of the finest examples of French Gothic architecture.',
    location: 'Paris, France',
    coordinates: { lat: 48.8530, lng: 2.3499 },
    rating: 4.6,
    reviews: 156789,
    images: [
      'https://images.pexels.com/photos/673862/pexels-photo-673862.jpeg?auto=compress&cs=tinysrgb&h=800',
      'https://images.pexels.com/photos/705764/pexels-photo-705764.jpeg?auto=compress&cs=tinysrgb&h=800'
    ],
    categories: ['Religious', 'Historical', 'Architecture'],
    priceLevel: 1,
    bestTimeToVisit: 'Early morning',
    duration: '1-2 hours',
    goodFor: ['History buffs', 'Architecture enthusiasts', 'Photography'],
    crowdLevel: 3,
    distance: '1.5 miles',
    transportOptions: ['Walking', 'Metro', 'Bus']
  },
  {
    id: '4',
    name: 'Arc de Triomphe',
    description: 'The Arc de Triomphe de l\'Étoile is one of the most famous monuments in Paris, France, standing at the western end of the Champs-Élysées at the centre of Place Charles de Gaulle, formerly named Place de l\'Étoile.',
    location: 'Paris, France',
    coordinates: { lat: 48.8738, lng: 2.2950 },
    rating: 4.7,
    reviews: 134567,
    images: [
      'https://images.pexels.com/photos/2344/cars-france-landmark-lights.jpg?auto=compress&cs=tinysrgb&h=800',
      'https://images.pexels.com/photos/91485/pexels-photo-91485.jpeg?auto=compress&cs=tinysrgb&h=800'
    ],
    categories: ['Landmark', 'Historical', 'Architecture'],
    priceLevel: 1,
    bestTimeToVisit: 'Late afternoon',
    duration: '1 hour',
    goodFor: ['History buffs', 'Photography', 'First-time visitors'],
    crowdLevel: 2,
    distance: '2.1 miles',
    transportOptions: ['Metro', 'Bus', 'Walking']
  },
  {
    id: '5',
    name: 'Montmartre',
    description: 'Montmartre is a large hill in Paris\'s 18th arrondissement. It is 130 meters high and gives its name to the surrounding district, part of the Right Bank in the northern section of the city. The historic district established on the hill has long been known for its artistic history.',
    location: 'Paris, France',
    coordinates: { lat: 48.8867, lng: 2.3431 },
    rating: 4.5,
    reviews: 98765,
    images: [
      'https://images.pexels.com/photos/705782/pexels-photo-705782.jpeg?auto=compress&cs=tinysrgb&h=800',
      'https://images.pexels.com/photos/2346/city-landscape-lights-night.jpg?auto=compress&cs=tinysrgb&h=800'
    ],
    categories: ['Neighborhood', 'Cultural', 'Art'],
    priceLevel: 1,
    bestTimeToVisit: 'Morning or sunset',
    duration: '2-3 hours',
    goodFor: ['Art lovers', 'Photography', 'Cultural experience'],
    crowdLevel: 2,
    distance: '3.2 miles',
    transportOptions: ['Metro', 'Bus', 'Walking']
  },
  {
    id: '6',
    name: 'Champs-Élysées',
    description: 'The Avenue des Champs-Élysées is an avenue in the 8th arrondissement of Paris, France, 1.9 kilometers long and 70 meters wide, running between the Place de la Concorde and the Place Charles de Gaulle, where the Arc de Triomphe is located.',
    location: 'Paris, France',
    coordinates: { lat: 48.8698, lng: 2.3072 },
    rating: 4.4,
    reviews: 89012,
    images: [
      'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&h=800',
      'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg?auto=compress&cs=tinysrgb&h=800'
    ],
    categories: ['Shopping', 'Urban', 'Entertainment'],
    priceLevel: 3,
    bestTimeToVisit: 'Evening',
    duration: '2-3 hours',
    goodFor: ['Shopping enthusiasts', 'People watching', 'Luxury experience'],
    crowdLevel: 3,
    distance: '1.9 miles',
    transportOptions: ['Metro', 'Bus', 'Walking']
  }
];

export function mockSearch(query: string): Attraction[] {
  // In a real app, this would filter results based on location
  // For now, we'll just return the mock data for any query
  
  // Add a simple lowercase comparison to show "relevant" results
  if (query.toLowerCase().includes('tokyo')) {
    return attractions.map(a => ({
      ...a,
      name: a.name.replace('Paris', 'Tokyo'),
      location: a.location.replace('Paris, France', 'Tokyo, Japan')
    }));
  }
  
  if (query.toLowerCase().includes('new york')) {
    return attractions.map(a => ({
      ...a,
      name: a.name.replace('Paris', 'New York'),
      location: a.location.replace('Paris, France', 'New York, USA')
    }));
  }
  
  return attractions;
}