import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Enter Your Destination",
      description: "Start by entering any location you want to explore. It could be a city, landmark, or region.",
      image: "https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&h=650"
    },
    {
      number: "02",
      title: "Discover Attractions",
      description: "Browse through our curated list of attractions, sorted by popularity, distance, or category.",
      image: "https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&h=650"
    },
    {
      number: "03",
      title: "Plan Your Route",
      description: "Select your preferred transportation methods and see optimized routes to visit multiple attractions.",
      image: "https://images.pexels.com/photos/3760958/pexels-photo-3760958.jpeg?auto=compress&cs=tinysrgb&h=650"
    },
    {
      number: "04",
      title: "Save & Enjoy",
      description: "Save your personalized itinerary, check the best times to visit, and start your adventure!",
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&h=650"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How TravelSage Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Planning your perfect trip is easy with our simple 4-step process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col">
              <Card className="relative overflow-hidden h-64 mb-6 border-0 shadow-lg">
                <div className="absolute inset-0">
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"
                  />
                  <div 
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${step.image})` }}
                  />
                </div>
                <CardContent className="relative z-20 h-full flex flex-col justify-end p-6">
                  <span className="text-5xl font-bold text-white/70 mb-2">{step.number}</span>
                  <h3 className="text-xl font-semibold text-white mb-1">{step.title}</h3>
                </CardContent>
              </Card>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 bg-card rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center">Why Choose TravelSage?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            {[
              "Real-time data from trusted APIs",
              "Personalized recommendations",
              "Time-saving route optimization",
              "Weather and crowd insights",
              "Multi-modal transportation options",
              "Save and share your itineraries",
              "User-friendly mobile experience",
              "Offline access to saved trips"
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}