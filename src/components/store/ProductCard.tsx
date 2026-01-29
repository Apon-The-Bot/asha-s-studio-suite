import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.product_images?.find(img => img.is_primary)?.url 
    || product.product_images?.[0]?.url 
    || '/placeholder.svg';

  const discount = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.slug}`} className="block product-card group">
        <div className="relative aspect-product overflow-hidden">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            )}
            {product.featured && (
              <Badge className="text-xs bg-primary">
                Bestseller
              </Badge>
            )}
          </div>
          {/* Stock badge */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
          )}
          
          {/* Title */}
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="price-compare">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
