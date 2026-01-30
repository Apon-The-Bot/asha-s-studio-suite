import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  categories: any[];
  subcategories: any[];
  tags: any[];
}

export default function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  subcategories,
  tags,
}: ProductDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [form, setForm] = useState({
    title: '',
    slug: '',
    price: '',
    compare_price: '',
    short_description: '',
    long_description: '',
    category_id: '',
    subcategory_id: '',
    stock_qty: '0',
    in_stock: true,
    featured: false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; is_primary: boolean; file?: File }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        slug: product.slug || '',
        price: String(product.price || ''),
        compare_price: product.compare_price ? String(product.compare_price) : '',
        short_description: product.short_description || '',
        long_description: product.long_description || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        stock_qty: String(product.stock_qty || 0),
        in_stock: product.in_stock ?? true,
        featured: product.featured ?? false,
      });
      setSelectedTags(product.product_tags?.map((pt: any) => pt.tag_id || pt.tag?.id) || []);
      setImages(
        product.product_images?.map((img: any) => ({
          url: img.url,
          is_primary: img.is_primary,
          id: img.id,
        })) || []
      );
    } else {
      setForm({
        title: '',
        slug: '',
        price: '',
        compare_price: '',
        short_description: '',
        long_description: '',
        category_id: '',
        subcategory_id: '',
        stock_qty: '0',
        in_stock: true,
        featured: false,
      });
      setSelectedTags([]);
      setImages([]);
    }
  }, [product, open]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEdit ? prev.slug : generateSlug(title),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages: { url: string; is_primary: boolean; file?: File }[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImages.push({
          url: publicUrl,
          is_primary: images.length === 0 && newImages.length === 0,
        });
      }

      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error: any) {
      toast.error('Failed to upload images: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      if (newImages.length > 0 && !newImages.some((img) => img.is_primary)) {
        newImages[0].is_primary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.slug) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        title: form.title,
        slug: form.slug,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        short_description: form.short_description || null,
        long_description: form.long_description || null,
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        stock_qty: parseInt(form.stock_qty) || 0,
        in_stock: form.in_stock,
        featured: form.featured,
      };

      let productId = product?.id;

      if (isEdit) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
        if (error) throw error;

        // Delete existing images and tags
        await supabase.from('product_images').delete().eq('product_id', productId);
        await supabase.from('product_tags').delete().eq('product_id', productId);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Insert images
      if (images.length > 0) {
        const imageInserts = images.map((img, i) => ({
          product_id: productId,
          url: img.url,
          is_primary: img.is_primary,
          sort_order: i,
        }));
        const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
        if (imgError) throw imgError;
      }

      // Insert tags
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map((tagId) => ({
          product_id: productId,
          tag_id: tagId,
        }));
        const { error: tagError } = await supabase.from('product_tags').insert(tagInserts);
        if (tagError) throw tagError;
      }

      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to save product: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredSubcategories = subcategories?.filter(
    (sub) => sub.category_id === form.category_id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Product title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="product-slug"
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (৳) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compare_price">Compare Price (৳)</Label>
              <Input
                id="compare_price"
                type="number"
                step="0.01"
                value={form.compare_price}
                onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              placeholder="Brief product description..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              value={form.long_description}
              onChange={(e) => setForm({ ...form, long_description: e.target.value })}
              placeholder="Detailed product description..."
              rows={4}
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category_id}
                onValueChange={(val) => setForm({ ...form, category_id: val, subcategory_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                value={form.subcategory_id}
                onValueChange={(val) => setForm({ ...form, subcategory_id: val })}
                disabled={!form.category_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories?.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-secondary/50">
              {tags?.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags?.length === 0 && (
                <span className="text-muted-foreground text-sm">No tags available</span>
              )}
            </div>
          </div>

          {/* Stock & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_qty">Stock Quantity</Label>
              <Input
                id="stock_qty"
                type="number"
                value={form.stock_qty}
                onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Switch
                id="in_stock"
                checked={form.in_stock}
                onCheckedChange={(val) => setForm({ ...form, in_stock: val })}
              />
              <Label htmlFor="in_stock">In Stock</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Switch
                id="featured"
                checked={form.featured}
                onCheckedChange={(val) => setForm({ ...form, featured: val })}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <Label>Product Images</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`relative group w-24 h-24 rounded-lg overflow-hidden border-2 ${
                    img.is_primary ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(i)}
                      className="p-1 bg-primary rounded text-white text-xs"
                      title="Set as primary"
                    >
                      <ImageIcon className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-1 bg-destructive rounded text-white text-xs"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {img.is_primary && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs text-center py-0.5">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">
                  {uploading ? 'Uploading...' : 'Upload'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
