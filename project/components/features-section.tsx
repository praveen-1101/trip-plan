import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon, TrainFront, Clock, HeartIcon, Compass, Cloud, Users, CalendarCheck } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <MapIcon className="h-12 w-12 text-chart-1" />,
      title: "Nearby Attractions",
      description: "Discover the best tourist spots around your location with ratings and reviews from real travelers."
    },
    {
      icon: <TrainFront className="h-12 w-12 text-chart-2" />,
      title: "Optimal Routes",
      description: "Find the best transportation options including trains, buses, and rideshare services to reach your destinations."
    },
    {
      icon: <Clock className="h-12 w-12 text-chart-3" />,
      title: "Perfect Timing",
      description: "Know the best time to visit each attraction based on weather patterns and crowd data."
    },
    {
      icon: <HeartIcon className="h-12 w-12 text-chart-4" />,
      title: "Personalized Trips",
      description: "Create custom itineraries based on your preferences for budget, adventure level, or historical interests."
    },
    {
      icon: <Compass className="h-12 w-12 text-chart-1" />,
      title: "Interactive Maps",
      description: "Visualize your entire journey with interactive maps showing all attractions and routes."
    },
    {
      icon: <Cloud className="h-12 w-12 text-chart-5" />,
      title: "Weather Insights",
      description: "Get detailed weather forecasts for your planned visits to help pack appropriately."
    },
    {
      icon: <Users className="h-12 w-12 text-chart-2" />,
      title: "Crowd Prediction",
      description: "Avoid the crowds with insights on the busiest times at popular attractions."
    },
    {
      icon: <CalendarCheck className="h-12 w-12 text-chart-3" />,
      title: "Save & Share",
      description: "Save your favorite itineraries and share them with friends and family."
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plan Your Perfect Trip
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our intelligent travel platform helps you discover, plan, and enjoy the best travel experiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border bg-card hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}