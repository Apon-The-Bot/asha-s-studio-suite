import { useParams } from 'react-router-dom';
import { useCategory } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/store/ProductGrid';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useCategory(slug || '');
  const { data: products, isLoading: productsLoading } = useProducts({ categorySlug: slug });

  if (categoryLoading) {
    return (
      <div>
        <div className="bg-secondary/50 py-8 md:py-12">
          <div className="container-custom">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="container-custom py-8">
          <ProductGrid products={undefined} loading={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-secondary/50 py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{category?.name}</h1>
          <p className="text-muted-foreground">
            {products?.length || 0} products
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <ProductGrid products={products} loading={productsLoading} />
      </div>
    </div>
  );
}
