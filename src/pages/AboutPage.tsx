import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStoreInfo } from '@/hooks/useSettings';

export default function AboutPage() {
  const storeInfo = useStoreInfo();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-16 md:py-24">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Story</h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Bringing you handcrafted treasures from Bangladesh's finest artisans
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg">
              <h2 className="font-serif">Welcome to {storeInfo.name}</h2>
              <p className="text-muted-foreground">
                We are passionate about bringing you the finest handcrafted products from talented artisans across Bangladesh. Our journey began with a simple belief: that beautiful, handmade products should be accessible to everyone.
              </p>

              <p className="text-muted-foreground">
                Each piece in our collection tells a story - of skilled hands that crafted it, of traditions passed down through generations, and of the love that goes into every stitch, every bead, every detail.
              </p>

              <h3 className="font-serif mt-8">Our Mission</h3>
              <p className="text-muted-foreground">
                We're committed to supporting local artisans and preserving traditional crafts while making them available to customers across Bangladesh and beyond. When you shop with us, you're not just buying a product - you're supporting a community of talented craftspeople.
              </p>

              <h3 className="font-serif mt-8">Why Choose Us?</h3>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Authentic Handcrafted Products:</strong> Every item is carefully crafted by skilled artisans</li>
                <li><strong>Quality Guarantee:</strong> We stand behind the quality of every product we sell</li>
                <li><strong>Cash on Delivery:</strong> Pay only when you receive your order</li>
                <li><strong>Fast Delivery:</strong> We deliver across Bangladesh within 3-7 business days</li>
                <li><strong>Easy Returns:</strong> Not satisfied? Return within 7 days for a full refund</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-secondary">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-serif font-bold mb-6">Get in Touch</h2>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <span>{storeInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <span>{storeInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{storeInfo.address}</span>
            </div>
          </div>
          <a href={storeInfo.whatsapp} target="_blank" rel="noopener noreferrer">
            <Button size="lg">
              <MessageCircle className="h-5 w-5 mr-2" /> Chat on WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
