import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import CategoryDialog from '@/components/admin/CategoryDialog';
import TagDialog from '@/components/admin/TagDialog';

export default function AdminCategories() {
  const queryClient = useQueryClient();

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'category' | 'subcategory' | 'tag'; id: string } | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      return data || [];
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ['admin-subcategories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subcategories')
        .select('*, category:categories(name)')
        .order('sort_order');
      return data || [];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const { data } = await supabase.from('tags').select('*').order('name');
      return data || [];
    },
  });

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const tableName = deleteItem.type === 'category' 
        ? 'categories' 
        : deleteItem.type === 'subcategory' 
          ? 'subcategories' 
          : 'tags';

      const { error } = await supabase.from(tableName).delete().eq('id', deleteItem.id);
      if (error) throw error;

      toast.success(`${deleteItem.type} deleted!`);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    } finally {
      setDeleteItem(null);
    }
  };

  const openCategoryEdit = (cat: any) => {
    setEditingItem(cat);
    setCategoryDialogOpen(true);
  };

  const openSubcategoryEdit = (sub: any) => {
    setEditingItem(sub);
    setSubcategoryDialogOpen(true);
  };

  const openTagEdit = (tag: any) => {
    setEditingItem(tag);
    setTagDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Categories & Tags</h1>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Categories</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setCategoryDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {categories?.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No categories yet</p>
          )}
          {categories?.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {cat.image_url && (
                  <img src={cat.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                )}
                <div>
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">({cat.slug})</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openCategoryEdit(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteItem({ type: 'category', id: cat.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Subcategories</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setSubcategoryDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {subcategories?.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No subcategories yet</p>
          )}
          {subcategories?.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div>
                <span className="font-medium">{sub.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({sub.category?.name} → {sub.slug})
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openSubcategoryEdit(sub)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteItem({ type: 'subcategory', id: sub.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Tags</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setTagDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags?.length === 0 && (
            <p className="text-muted-foreground">No tags yet</p>
          )}
          {tags?.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full group"
            >
              <span className="text-sm">{tag.name}</span>
              <button
                onClick={() => openTagEdit(tag)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => setDeleteItem({ type: 'tag', id: tag.id })}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        category={editingItem}
        type="category"
      />

      <CategoryDialog
        open={subcategoryDialogOpen}
        onOpenChange={(open) => {
          setSubcategoryDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        category={editingItem}
        type="subcategory"
        parentCategories={categories}
      />

      <TagDialog
        open={tagDialogOpen}
        onOpenChange={(open) => {
          setTagDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        tag={editingItem}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteItem?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Products using this {deleteItem?.type} may be affected.
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
