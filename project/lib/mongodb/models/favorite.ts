import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  placeId: { type: String, required: true },
  placeName: { type: String, required: true },
  placeDescription: { type: String },
  placeLocation: { type: String },
  placeImage: { type: String },
  coordinates: {
    lat: { type: Number},
    lng: { type: Number}
  },
  rating: { type: Number },
  bestTimeToVisit: { type: String },
  duration: { type: String },
  distance: { type: String },
  priceLevel: { type: Number },
  categories: { type: [String], default: [] },
  goodFor: { type: [String], default: [] },
  temperature: { type: String },
  weatherForecast: { type: String },
  crowdLevel: { type: String },
  bestRoutes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);

export default Favorite; 