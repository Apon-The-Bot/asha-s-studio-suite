import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCategories() {
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
      const { data } = await supabase.from('subcategories').select('*, category:categories(name)').order('sort_order');
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Categories & Tags</h1>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Categories</h2>
        <div className="space-y-2">
          {categories?.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="font-medium">{cat.name}</span>
              <span className="text-sm text-muted-foreground">{cat.slug}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Subcategories</h2>
        <div className="space-y-2">
          {subcategories?.map(sub => (
            <div key={sub.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <span className="font-medium">{sub.name}</span>
                <span className="text-sm text-muted-foreground ml-2">({sub.category?.name})</span>
              </div>
              <span className="text-sm text-muted-foreground">{sub.slug}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags?.map(tag => (
            <span key={tag.id} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
