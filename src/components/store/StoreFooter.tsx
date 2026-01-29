import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useStoreInfo } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';

export default function StoreFooter() {
  const storeInfo = useStoreInfo();
  const { data: categories } = useCategories();

  return (
    <footer className="bg-foreground text-background">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-serif font-bold text-primary mb-4">
              {storeInfo.name}
            </h3>
            <p className="text-muted-foreground/80 text-sm mb-4">
              Handcrafted with love. Discover unique artisanal products that bring beauty to your everyday life.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground/80 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground/80 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-sm text-muted-foreground/80 hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              {categories?.slice(0, 4).map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/track-order" className="text-sm text-muted-foreground/80 hover:text-primary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground/80 hover:text-primary transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-muted-foreground/80 hover:text-primary transition-colors">
                  Return & Refund
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground/80 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground/80 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground/80">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{storeInfo.phone}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground/80">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{storeInfo.email}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{storeInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground/60">
              © {new Date().getFullYear()} {storeInfo.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground/60">💵 Cash on Delivery</span>
              <span className="text-sm text-muted-foreground/60">🚚 Fast Delivery</span>
              <span className="text-sm text-muted-foreground/60">✅ Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
