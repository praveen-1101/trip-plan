"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, Trash2, Car, Truck, Bike, Footprints } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatDistance, formatDuration } from "@/lib/openroute";
import { TransportMode } from "@/types/transportation";

interface ItineraryItem {
  _id: string;
  placeId: string;
  placeName: string;
  placeDescription: string;
  placeLocation: string;
  placeImage: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  date: string;
  createdAt: string;
  transportationModes: Record<TransportMode, { distance: number; duration: number } | null>;
}

interface GroupedItinerary {
  [date: string]: ItineraryItem[];
}

const transportIcons: Record<TransportMode, React.ReactNode> = {
  "driving-car": <Car className="h-4 w-4" />,
  "cycling-regular": <Bike className="h-4 w-4" />,
  "foot-walking": <Footprints className="h-4 w-4" />,
};

const transportLabels: Record<TransportMode, string> = {
  "driving-car": "Car",
  "cycling-regular": "Bike",
  "foot-walking": "Walk",
};

export function ItineraryList() {
  const { data: session } = useSession();
  const [itinerary, setItinerary] = useState<GroupedItinerary>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchItinerary();
    }
  }, [session]);

  const fetchItinerary = async () => {
    try {
      const response = await fetch("/api/itinerary");
      const data = await response.json();

      // Group items by date
      const groupedItems = data.reduce((acc: GroupedItinerary, item: ItineraryItem) => {
        const date = format(new Date(item.date), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      // Sort dates
      const sortedDates = Object.keys(groupedItems).sort();
      const sortedItinerary = sortedDates.reduce((acc: GroupedItinerary, date) => {
        acc[date] = groupedItems[date];
        return acc;
      }, {});

      setItinerary(sortedItinerary);
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      toast.error("Failed to load itinerary");
    } finally {
      setLoading(false);
    }
  };

  const removeFromItinerary = async (itemId: string) => {
    try {
      const response = await fetch(`/api/itinerary/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Removed from itinerary");
        fetchItinerary();
      } else {
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing from itinerary:", error);
      toast.error("Failed to remove from itinerary");
    }
  };

  if (loading) {
    return (
      <div className="flex-center min-h-[200px]">
        <div className="loading-spinner h-8 w-8" />
      </div>
    );
  }

  if (Object.keys(itinerary).length === 0) {
    return (
      <div className="flex-center min-h-[200px] text-gray-500 dark:text-gray-400">
        <p>Your itinerary is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(itinerary).map(([date, items]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Calendar className="h-5 w-5 text-red-500" />
            <h3>{format(new Date(date), "MMMM d, yyyy")}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="modern-card group relative overflow-hidden"
              >
                <div className="aspect-video overflow-hidden rounded-xl">
                  <img
                    src={item.placeImage}
                    alt={item.placeName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {item.placeName}
                  </h4>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.placeDescription}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{item.placeLocation}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(item.date), "h:mm a")}</span>
                    </div>
                    {item.transportationModes && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(item.transportationModes).map(([mode, data]) => {
                          if (!data) return null;
                          return (
                            <div
                              key={mode}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                {transportIcons[mode as TransportMode]}
                                <span>{transportLabels[mode as TransportMode]}</span>
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {formatDistance(data.distance)} • {formatDuration(data.duration)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => removeFromItinerary(item._id)}
                      className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 