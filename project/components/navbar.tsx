'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Heart, Map, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Map className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text">Travel Planner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link href="/explore" className="text-foreground/80 hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/favorites" className="text-foreground/80 hover:text-primary transition-colors">
              Favorites
            </Link>
            <Link href="/itinerary" className="text-foreground/80 hover:text-primary transition-colors">
              Itinerary
            </Link>
            {session ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
                <ModeToggle />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
                <ModeToggle />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-40 pt-20">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col space-y-6">
                <Link
                  href="/"
                  className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  href="/explore"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  href="/favorites"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Favorites
                </Link>
                <Link
                  href="/itinerary"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Itinerary
                </Link>
                {session ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full justify-start text-lg bg-primary hover:bg-primary/90">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 