import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ContactSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions about our travel planning services? We're here to help! Reach out to us through any of the following channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Office Location */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Office Location</h3>
                <p className="text-muted-foreground">
                  123 Travel Street<br />
                  Suite 456<br />
                  New York, NY 10001<br />
                  United States
                </p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Info</h3>
                <p className="text-muted-foreground">
                  Phone: +1 (555) 123-4567<br />
                  Fax: +1 (555) 987-6543<br />
                  Email: contact@travelplanner.com
                </p>
              </div>
            </div>
          </Card>

          {/* Business Hours */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Map and Additional Info */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Global Presence</h3>
                <p className="text-muted-foreground">
                  We have offices and partners in major cities worldwide, ensuring you get the best local insights for your travel plans.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">New York</span>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">London</span>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">Tokyo</span>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">Sydney</span>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">Dubai</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Get in Touch</h3>
                <p className="text-muted-foreground mb-4">
                  Have a specific question or need personalized assistance? Our team is ready to help you plan your perfect trip.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Customer Support:</span><br />
                    support@travelplanner.com
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Business Inquiries:</span><br />
                    business@travelplanner.com
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Press & Media:</span><br />
                    press@travelplanner.com
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
} 