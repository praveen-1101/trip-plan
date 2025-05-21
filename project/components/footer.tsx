import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Us</h3>
            <p className="text-sm text-muted-foreground">
              We help you discover and plan your perfect travel experience with AI-powered recommendations and real-time weather forecasts.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-muted-foreground hover:text-primary">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/itinerary" className="text-sm text-muted-foreground hover:text-primary">
                  Itinerary
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-sm text-muted-foreground hover:text-primary">
                  Favorites
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explore#weather" className="text-sm text-muted-foreground hover:text-primary">
                  Weather Forecast
                </Link>
              </li>
              <li>
                <Link href="/explore#routes" className="text-sm text-muted-foreground hover:text-primary">
                  Best Routes
                </Link>
              </li>
              <li>
                <Link href="/explore#attractions" className="text-sm text-muted-foreground hover:text-primary">
                  Attractions
                </Link>
              </li>
              <li>
                <Link href="/explore#planning" className="text-sm text-muted-foreground hover:text-primary">
                  Trip Planning
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-muted-foreground hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Travel Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}