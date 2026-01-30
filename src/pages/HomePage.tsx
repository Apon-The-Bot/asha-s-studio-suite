import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import ProductGrid from '@/components/store/ProductGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeContent } from '@/types';

const defaultContent: HomeContent = {
  hero_slides: [
    {
      id: '1',
      title: 'Discover Unique Artisan Crafts',
      subtitle: "Explore our collection of handmade jewelry, home decor, and traditional clothing from Bangladesh's finest artisans.",
      cta_text: 'Shop Now',
      cta_link: '/shop',
      image_url: '',
    },
  ],
  testimonials: [
    { id: '1', name: 'Fatima Rahman', text: 'Beautiful jewelry! The quality exceeded my expectations.', rating: 5 },
    { id: '2', name: 'Nusrat Jahan', text: 'Fast delivery and the saree was exactly as shown. Love it!', rating: 5 },
    { id: '3', name: 'Ayesha Begum', text: 'Great customer service. Will definitely order again.', rating: 5 },
  ],
  hero_badge_text: 'Handcrafted with Love',
};

export default function HomePage() {
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: categories } = useCategories();
  const { data: settings } = useSettings();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [homeContent, setHomeContent] = useState<HomeContent>(defaultContent);

  useEffect(() => {
    if (settings?.homepageContent) {
      setHomeContent(settings.homepageContent);
    }
  }, [settings]);

  const heroSlides = homeContent.hero_slides;
  const testimonials = homeContent.testimonials;

  const trustBadges = [
    { icon: CreditCard, title: 'Cash on Delivery', desc: 'Pay when you receive' },
    { icon: Truck, title: 'Fast Delivery', desc: '3-7 business days' },
    { icon: Shield, title: 'Quality Guaranteed', desc: 'Handcrafted with care' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const currentHero = heroSlides[currentSlide] || heroSlides[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: currentHero?.image_url
                ? `url(${currentHero.image_url})`
                : undefined,
            }}
          >
            <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          </motion.div>
        </AnimatePresence>

        <div className="container-custom relative z-10">
          <div className="py-16 md:py-24 lg:py-32 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-primary-foreground/80 mb-3 text-sm uppercase tracking-wider">
                  {homeContent.hero_badge_text}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-balance">
                  {currentHero?.title}
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-lg">
                  {currentHero?.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to={currentHero?.cta_link || '/shop'}>
                    <Button size="lg" variant="secondary" className="font-semibold">
                      {currentHero?.cta_text || 'Shop Now'} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button size="lg" variant="ghost" className="btn-ghost-light">
                      Our Story
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slider Controls */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-secondary/50">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="trust-badge"
              >
                <badge.icon className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="section-heading">Shop by Category</h2>
            <p className="text-muted-foreground">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories?.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className="block group relative aspect-category rounded-xl overflow-hidden bg-secondary"
                >
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-4 md:p-6">
                    <div>
                      <h3 className="text-white font-serif font-semibold text-lg md:text-xl">
                        {cat.name}
                      </h3>
                      <span className="text-white/80 text-sm group-hover:underline">
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">Bestsellers</h2>
              <p className="text-muted-foreground">Our most loved products</p>
            </div>
            <Link to="/shop">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={featuredProducts} loading={productsLoading} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="section-heading">What Our Customers Say</h2>
            <p className="text-muted-foreground">Real reviews from happy customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="bg-card p-6 rounded-xl shadow-card"
              >
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-foreground mb-4">"{t.text}"</p>
                <p className="text-sm font-medium text-muted-foreground">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Ready to Shop?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Browse our complete collection and find something you'll love. Cash on delivery available nationwide.
          </p>
          <Link to="/shop">
            <Button size="lg" variant="secondary">
              Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
