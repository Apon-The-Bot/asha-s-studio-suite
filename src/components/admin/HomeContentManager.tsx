import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import { HomeContent, HeroSlide, Testimonial } from '@/types';

const defaultContent: HomeContent = {
  hero_slides: [
    {
      id: '1',
      title: 'Discover Unique Artisan Crafts',
      subtitle: 'Explore our collection of handmade jewelry, home decor, and traditional clothing from Bangladesh\'s finest artisans.',
      cta_text: 'Shop Now',
      cta_link: '/shop',
      image_url: '',
    },
  ],
  testimonials: [
    { id: '1', name: 'Fatima Rahman', text: 'Beautiful jewelry! The quality exceeded my expectations.', rating: 5 },
    { id: '2', name: 'Nusrat Jahan', text: 'Fast delivery and the saree was exactly as shown. Love it!', rating: 5 },
    { id: '3', name: 'Ayesha Begum', text: 'Great customer service. Will definitely order again.', rating: 5 },
  ],
  hero_badge_text: 'Handcrafted with Love',
};

export default function HomeContentManager() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'homepage_content')
      .single();

    if (data?.value) {
      setContent(data.value as unknown as HomeContent);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').upsert([
        { key: 'homepage_content', value: JSON.parse(JSON.stringify(content)) },
      ], { onConflict: 'key' });
      if (error) throw error;
      toast.success('Home page content saved!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (slideId: string, file: File) => {
    setUploading(slideId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setContent((prev) => ({
        ...prev,
        hero_slides: prev.hero_slides.map((s) =>
          s.id === slideId ? { ...s, image_url: publicUrl } : s
        ),
      }));
      toast.success('Image uploaded!');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  const addSlide = () => {
    setContent((prev) => ({
      ...prev,
      hero_slides: [
        ...prev.hero_slides,
        {
          id: Date.now().toString(),
          title: 'New Slide',
          subtitle: 'Slide description',
          cta_text: 'Shop Now',
          cta_link: '/shop',
          image_url: '',
        },
      ],
    }));
  };

  const removeSlide = (id: string) => {
    if (content.hero_slides.length <= 1) {
      toast.error('At least one slide is required');
      return;
    }
    setContent((prev) => ({
      ...prev,
      hero_slides: prev.hero_slides.filter((s) => s.id !== id),
    }));
  };

  const updateSlide = (id: string, field: keyof HeroSlide, value: string) => {
    setContent((prev) => ({
      ...prev,
      hero_slides: prev.hero_slides.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const addTestimonial = () => {
    setContent((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { id: Date.now().toString(), name: 'Customer Name', text: 'Review text...', rating: 5 },
      ],
    }));
  };

  const removeTestimonial = (id: string) => {
    setContent((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: string | number) => {
    setContent((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Badge Text */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Badge Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={content.hero_badge_text}
            onChange={(e) => setContent({ ...content, hero_badge_text: e.target.value })}
            placeholder="e.g., Handcrafted with Love"
          />
        </CardContent>
      </Card>

      {/* Hero Slides */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hero Slides</CardTitle>
          <Button onClick={addSlide} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Slide
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.hero_slides.map((slide, index) => (
            <div key={slide.id} className="p-4 border rounded-lg bg-secondary/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Slide {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlide(slide.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Text</Label>
                  <Input
                    value={slide.cta_text}
                    onChange={(e) => updateSlide(slide.id, 'cta_text', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Textarea
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input
                    value={slide.cta_link}
                    onChange={(e) => updateSlide(slide.id, 'cta_link', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={slide.image_url}
                      onChange={(e) => updateSlide(slide.id, 'image_url', e.target.value)}
                      placeholder="Image URL or upload"
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <Button variant="outline" size="icon" asChild disabled={uploading === slide.id}>
                        <span>
                          <Upload className="h-4 w-4" />
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(slide.id, file);
                        }}
                      />
                    </label>
                  </div>
                  {slide.image_url && (
                    <img
                      src={slide.image_url}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Testimonials</CardTitle>
          <Button onClick={addTestimonial} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Testimonial
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="p-4 border rounded-lg bg-secondary/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Testimonial {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestimonial(testimonial.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={testimonial.rating}
                    onChange={(e) => updateTestimonial(testimonial.id, 'rating', parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Review Text</Label>
                <Textarea
                  value={testimonial.text}
                  onChange={(e) => updateTestimonial(testimonial.id, 'text', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={saveContent} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Home Page Content'}
      </Button>
    </div>
  );
}
