import mongoose from 'mongoose';

interface ItineraryItem {
  userId: string;
  placeId: string;
  placeName: string;
  placeDescription: string;
  placeLocation: string;
  placeImage: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  transportationModes: {
    "driving-car": { distance: number; duration: number };
    "cycling-regular": { distance: number; duration: number };
    "foot-walking": { distance: number; duration: number };
  };
  date: Date;
  createdAt: Date;
  rating: number;
  bestTimeToVisit: string;
  duration: string;
  distance: string;
  crowdLevel: string;
  priceLevel: number;
  categories: string[];
  goodFor: string[];
}

const itinerarySchema = new mongoose.Schema<ItineraryItem>({
  userId: { type: String, required: true },
  placeId: { type: String, required: true },
  placeName: { type: String, required: true },
  placeDescription: { type: String },
  placeLocation: { type: String },
  placeImage: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  transportationModes: {
    "driving-car": {
      type: {
        distance: { type: Number },
        duration: { type: Number },
      }
    },
    "cycling-regular": {
      type: {
        distance: { type: Number },
        duration: { type: Number },
      }
    },
    "foot-walking": {
      type: {
        distance: { type: Number },
        duration: { type: Number },
      }
    },
  },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number },
  bestTimeToVisit: { type: String },
  duration: { type: String },
  crowdLevel: { type: String },
  distance: { type: String },
  priceLevel: { type: Number },
  categories: { type: [String], default: [] },
  goodFor: { type: [String], default: [] },
});

// Create a compound index to prevent duplicate itinerary items for the same day and same place
itinerarySchema.index({ userId: 1, placeId: 1, date: 1 }, { unique: true });

const Itinerary = mongoose.models.Itinerary || mongoose.model<ItineraryItem>('Itinerary', itinerarySchema);

export default Itinerary; 