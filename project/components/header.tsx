'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { MapIcon, Menu } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { AuthButton } from '@/components/auth/auth-button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '/explore', label: 'Explore' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/itinerary', label: 'Itinerary' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        scrolled
          ? 'bg-background/90 backdrop-blur-md shadow-sm py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <MapIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">TravelSage</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {item.label}
          </Link>
          ))}
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <AuthButton />
          <Link href="/explore">
            <Button>Plan Your Trip</Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-foreground/80 hover:text-primary transition-colors text-lg"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col space-y-4 pt-4 border-t">
                  <ModeToggle />
                  <AuthButton />
                  <Link href="/explore" className="w-full">
                    <Button className="w-full">Plan Your Trip</Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}