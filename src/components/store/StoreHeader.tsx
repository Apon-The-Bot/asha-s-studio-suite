import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useCategories';
import { useStoreInfo } from '@/hooks/useSettings';
import { useNavigate } from 'react-router-dom';

export default function StoreHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getItemCount } = useCart();
  const { data: categories } = useCategories();
  const storeInfo = useStoreInfo();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
      <div className="container-custom">
        {/* Top bar - hidden on mobile */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-muted-foreground border-b border-border/50">
          <span>✨ Free shipping on orders over ৳2000</span>
          <div className="flex items-center gap-4">
            <span>{storeInfo.phone}</span>
            <Link to="/track-order" className="hover:text-primary transition-colors">
              Track Order
            </Link>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu trigger */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <h2 className="text-xl font-serif font-bold text-primary">{storeInfo.name}</h2>
                  </Link>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/shop"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        All Products
                      </Link>
                    </li>
                    {categories?.map(cat => (
                      <li key={cat.id}>
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-4 border-t border-border mt-4">
                      <Link
                        to="/track-order"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        Track Order
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/about"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-primary">
              {storeInfo.name}
            </h1>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
              Shop
            </Link>
            {categories?.slice(0, 4).map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search & Cart */}
          <div className="flex items-center gap-2">
            {/* Search - desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pr-8"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </form>

            {/* Search - mobile */}
            <Link to="/shop" className="md:hidden">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
