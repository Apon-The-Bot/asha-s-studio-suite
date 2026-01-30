import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import ProductDialog from '@/components/admin/ProductDialog';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, category:categories(name), product_images(*), product_tags(tag_id)')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      return data || [];
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ['admin-subcategories-list'],
    queryFn: async () => {
      const { data } = await supabase.from('subcategories').select('*').order('sort_order');
      return data || [];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ['admin-tags-list'],
    queryFn: async () => {
      const { data } = await supabase.from('tags').select('*').order('name');
      return data || [];
    },
  });

  const handleAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // Delete related records first
      await supabase.from('product_images').delete().eq('product_id', deleteId);
      await supabase.from('product_tags').delete().eq('product_id', deleteId);
      const { error } = await supabase.from('products').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Product deleted!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : products?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                products?.map((product) => {
                  const image =
                    product.product_images?.find((i: { is_primary: boolean }) => i.is_primary)
                      ?.url || product.product_images?.[0]?.url;
                  return (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img src={image} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{product.title}</span>
                            {product.featured && (
                              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatPrice(Number(product.price))}</td>
                      <td className="px-4 py-3">{product.stock_qty}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.in_stock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories || []}
        subcategories={subcategories || []}
        tags={tags || []}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product and all its images. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
