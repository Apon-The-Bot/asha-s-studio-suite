import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useProducts } from '@/hooks/useProducts';
import { useCategories, useSubcategories, useTags } from '@/hooks/useCategories';
import ProductGrid from '@/components/store/ProductGrid';
import { formatPrice } from '@/utils/formatters';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>(
    (searchParams.get('sort') as typeof sortBy) || 'newest'
  );
  const [inStockOnly, setInStockOnly] = useState(false);

  const { data: categories } = useCategories();
  const { data: subcategories } = useSubcategories(
    categories?.find(c => c.slug === selectedCategory)?.id
  );
  const { data: tags } = useTags();

  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    categorySlug: selectedCategory || undefined,
    subcategorySlug: selectedSubcategory || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
    sortBy,
    inStock: inStockOnly || undefined,
  });

  // Apply tag filter client-side
  const filteredProducts = products?.filter(p => {
    if (selectedTags.length === 0) return true;
    const productTagSlugs = p.product_tags?.map(pt => pt.tag.slug) || [];
    return selectedTags.some(tag => productTagSlugs.includes(tag));
  });

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [search, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedTags([]);
    setPriceRange([0, 10000]);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters = search || selectedCategory || selectedSubcategory || 
    selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000 || inStockOnly;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <Select value={selectedCategory} onValueChange={(v) => {
          setSelectedCategory(v === 'all' ? '' : v);
          setSelectedSubcategory('');
        }}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(cat => (
              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Subcategory</Label>
          <Select value={selectedSubcategory} onValueChange={(v) => setSelectedSubcategory(v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map(sub => (
                <SelectItem key={sub.id} value={sub.slug}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-4 block">
          Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </Label>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mt-2"
        />
      </div>

      {/* Tags */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Tags</Label>
        <div className="space-y-2">
          {tags?.map(tag => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={tag.slug}
                checked={selectedTags.includes(tag.slug)}
                onCheckedChange={(checked) => {
                  setSelectedTags(prev =>
                    checked
                      ? [...prev, tag.slug]
                      : prev.filter(t => t !== tag.slug)
                  );
                }}
              />
              <label htmlFor={tag.slug} className="text-sm cursor-pointer">
                {tag.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(!!checked)}
        />
        <label htmlFor="in-stock" className="text-sm cursor-pointer">
          In Stock Only
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/50 py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">
            {filteredProducts?.length || 0} products
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline">
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  {hasActiveFilters && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={filteredProducts} loading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
