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

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
  type: 'category' | 'subcategory';
  parentCategories?: any[];
}

export default function CategoryDialog({
  open,
  onOpenChange,
  category,
  type,
  parentCategories,
}: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    sort_order: '0',
    image_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        category_id: category.category_id || '',
        sort_order: String(category.sort_order || 0),
        image_url: category.image_url || '',
      });
    } else {
      setForm({
        name: '',
        slug: '',
        description: '',
        category_id: '',
        sort_order: '0',
        image_url: '',
      });
    }
  }, [category, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const table = type === 'category' ? 'categories' : 'subcategories';
      const data: any = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (type === 'category') {
        data.image_url = form.image_url || null;
      } else {
        if (!form.category_id) {
          toast.error('Please select a parent category');
          setSaving(false);
          return;
        }
        data.category_id = form.category_id;
      }

      if (isEdit) {
        const { error } = await supabase.from(table).update(data).eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(data);
        if (error) throw error;
      }

      toast.success(`${type === 'category' ? 'Category' : 'Subcategory'} ${isEdit ? 'updated' : 'created'}!`);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit' : 'Add'} {type === 'category' ? 'Category' : 'Subcategory'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={handleNameChange}
              placeholder="Category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="category-slug"
              required
            />
          </div>

          {type === 'subcategory' && (
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category *</Label>
              <select
                id="parent"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">Select parent category</option>
                {parentCategories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'category' && (
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
