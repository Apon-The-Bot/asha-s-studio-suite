import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface ProductFilters {
  categorySlug?: string;
  subcategorySlug?: string;
  tagSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular';
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*),
          product_images(*),
          product_tags(tag:tags(*))
        `);

      if (filters.categorySlug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.categorySlug)
          .single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (filters.subcategorySlug) {
        const { data: subcat } = await supabase
          .from('subcategories')
          .select('id')
          .eq('slug', filters.subcategorySlug)
          .single();
        if (subcat) query = query.eq('subcategory_id', subcat.id);
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.featured) {
        query = query.eq('featured', true);
      }

      if (filters.inStock) {
        query = query.eq('in_stock', true);
      }

      // Sorting
      switch (filters.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*),
          product_images(*),
          product_tags(tag:tags(*))
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useProducts({ featured: true, inStock: true });
}

export function useRelatedProducts(product: Product | undefined) {
  return useQuery({
    queryKey: ['related-products', product?.id],
    queryFn: async () => {
      if (!product) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          product_images(*)
        `)
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .eq('in_stock', true)
        .limit(4);

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!product?.id,
  });
}
