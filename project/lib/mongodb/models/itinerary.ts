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
  date: Date;
  createdAt: Date;
  rating: number;
  bestTimeToVisit: string;
  duration: string;
  distance: string;
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
    lat: { type: Number },
    lng: { type: Number },
  },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number },
  bestTimeToVisit: { type: String },
  duration: { type: String },
  distance: { type: String },
  priceLevel: { type: Number },
  categories: { type: [String], default: [] },
  goodFor: { type: [String], default: [] },
});

// Create a compound index to prevent duplicate itinerary items for the same day and same place
itinerarySchema.index({ userId: 1, placeId: 1, date: 1 }, { unique: true });

const Itinerary = mongoose.models.Itinerary || mongoose.model<ItineraryItem>('Itinerary', itinerarySchema);

export default Itinerary; 