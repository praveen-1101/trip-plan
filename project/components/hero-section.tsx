'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      router.push(`/explore?location=${encodeURIComponent(location)}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/20 pt-16">
      <div 
        className="absolute inset-0 overflow-hidden z-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&h=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Discover the Perfect 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-600 px-2">
              Travel Experience
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Find the best tourist spots, optimized routes, and perfect timing for your next adventure
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
              <Input
                type="text"
                placeholder="Where do you want to explore?"
                className="pl-10 py-6 text-lg rounded-full border-primary/20 focus:border-primary/50 focus:ring-primary/20"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="py-6 px-8 rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              Explore
            </Button>
          </form>
          
          <div className="mt-8 text-muted-foreground">
            <p>Popular destinations: 
              <button 
                onClick={() => setLocation('Paris')}
                className="text-primary hover:underline mx-2"
              >
                Paris
              </button>
              <button 
                onClick={() => setLocation('Tokyo')}
                className="text-primary hover:underline mx-2"
              >
                Tokyo
              </button>
              <button 
                onClick={() => setLocation('New York')}
                className="text-primary hover:underline mx-2"
              >
                New York
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}