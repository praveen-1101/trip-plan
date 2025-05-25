import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  placeId: {
    type: String,
    required: true,
  },
  placeName: { 
    type: String, 
    required: true,
    default: 'Unknown Place'
  },
  placeDescription: { 
    type: String,
    default: 'No description available'
  },
  placeLocation: { 
    type: String,
    default: 'Unknown Location'
  },
  placeImage: { 
    type: String,
    default: '/placeholder.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    default: 0
  },
  bestTimeToVisit: {
    type: String, 
    default: 'Anytime'
  },
  duration: {
    type: String,
    default: '1-2 hours'
  },
  distance: {
    type: String,
    default: 'Unknown'
  },
  priceLevel: {
    type: Number,
    default: 1
  },
  categories: {
    type: [String],
    default: []
  },  
  goodFor: {
    type: [String],
    default: []
  },
  temperature: {
    type: String, 
    default: 'Moderate'
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
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
  crowdLevel: {
    type: String,
    default: 'Moderate'
  },
  bestRoutes: {
    type: [String],
    default: []
  },
});

// Create a compound index to prevent duplicate favorites for the same user and place
favoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

// Clear existing model to prevent schema mismatch in hot reload
mongoose.models = {};

// Export a clean model
export default mongoose.model('Favorite', favoriteSchema);