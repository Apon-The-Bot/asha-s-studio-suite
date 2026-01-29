import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingCart, Zap, Truck, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useMetaPixel, useSettings } from '@/hooks/useSettings';
import { formatPrice } from '@/utils/formatters';
import { trackViewContent, trackAddToCart } from '@/utils/metaPixel';
import ProductGrid from '@/components/store/ProductGrid';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { data: relatedProducts } = useRelatedProducts(product);
  const { addItem } = useCart();
  const metaPixel = useMetaPixel();
  const { data: settings } = useSettings();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Track ViewContent event
  useEffect(() => {
    if (product && metaPixel.enabled) {
      trackViewContent({
        productId: product.id,
        productName: product.title,
        price: product.price,
        category: product.category?.name,
      });
    }
  }, [product?.id, metaPixel.enabled]);

  const images = product?.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const primaryImage = images[selectedImage]?.url || '/placeholder.svg';

  const discount = product?.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success('Added to cart!');
    
    if (metaPixel.enabled) {
      trackAddToCart({
        productId: product.id,
        productName: product.title,
        price: product.price,
        quantity,
      });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    navigate('/checkout');
  };

  if (error) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-secondary/30 py-3">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            {product?.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link to={`/category/${product.category.slug}`} className="hover:text-primary">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">
              {product?.title || 'Loading...'}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : product && (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-4">
                <img
                  src={primaryImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <Badge variant="destructive" className="absolute top-4 left-4">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === selectedImage ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              {/* Category */}
              {product.category && (
                <Link
                  to={`/category/${product.category.slug}`}
                  className="text-sm text-primary hover:underline mb-2"
                >
                  {product.category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compare_price)}
                  </span>
                )}
              </div>

              {/* Tags */}
              {product.product_tags && product.product_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.product_tags.map(pt => (
                    <Badge key={pt.tag.id} variant="secondary" className="tag-badge">
                      {pt.tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.in_stock ? (
                  <span className="stock-badge stock-badge-in">✓ In Stock ({product.stock_qty} available)</span>
                ) : (
                  <span className="stock-badge stock-badge-out">Out of Stock</span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-muted-foreground mb-6">{product.short_description}</p>
              )}

              {/* Quantity & Add to Cart */}
              {product.in_stock && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 btn-hero"
                      onClick={handleBuyNow}
                    >
                      <Zap className="h-5 w-5 mr-2" /> Buy Now
                    </Button>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span>{settings?.policies?.return_days || 7}-Day Returns</span>
                </div>
              </div>

              {/* Long Description */}
              {product.long_description && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-3">Product Details</h3>
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {product.long_description}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-serif font-bold mb-6">You May Also Like</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>

      {/* Sticky Mobile CTA */}
      {product?.in_stock && (
        <div className="sticky-cta md:hidden">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-1" /> Cart
            </Button>
            <Button
              className="flex-1 btn-hero"
              onClick={handleBuyNow}
            >
              <Zap className="h-4 w-4 mr-1" /> Buy Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
