import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [storeInfo, setStoreInfo] = useState({ name: '', phone: '', whatsapp: '', email: '', address: '' });
  const [deliveryCharges, setDeliveryCharges] = useState({ inside_city: 60, outside_city: 120, free_shipping_threshold: 2000 });
  const [metaPixel, setMetaPixel] = useState({ enabled: false, pixel_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('key, value');
      data?.forEach(item => {
        if (item.key === 'store_info') setStoreInfo(item.value as typeof storeInfo);
        if (item.key === 'delivery_charges') setDeliveryCharges(item.value as typeof deliveryCharges);
        if (item.key === 'meta_pixel') setMetaPixel(item.value as typeof metaPixel);
      });
    }
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await supabase.from('settings').upsert([
        { key: 'store_info', value: storeInfo },
        { key: 'delivery_charges', value: deliveryCharges },
        { key: 'meta_pixel', value: metaPixel },
      ], { onConflict: 'key' });
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Store Info */}
      <Card>
        <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Store Name</Label>
            <Input value={storeInfo.name} onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={storeInfo.phone} onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })} />
          </div>
          <div>
            <Label>WhatsApp Link</Label>
            <Input value={storeInfo.whatsapp} onChange={(e) => setStoreInfo({ ...storeInfo, whatsapp: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={storeInfo.email} onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })} />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Charges */}
      <Card>
        <CardHeader><CardTitle>Delivery Charges</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Inside Dhaka (৳)</Label>
            <Input type="number" value={deliveryCharges.inside_city} onChange={(e) => setDeliveryCharges({ ...deliveryCharges, inside_city: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Outside Dhaka (৳)</Label>
            <Input type="number" value={deliveryCharges.outside_city} onChange={(e) => setDeliveryCharges({ ...deliveryCharges, outside_city: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Free Shipping Threshold (৳)</Label>
            <Input type="number" value={deliveryCharges.free_shipping_threshold} onChange={(e) => setDeliveryCharges({ ...deliveryCharges, free_shipping_threshold: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      {/* Meta Pixel */}
      <Card>
        <CardHeader><CardTitle>Meta Pixel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Meta Pixel</Label>
            <Switch checked={metaPixel.enabled} onCheckedChange={(v) => setMetaPixel({ ...metaPixel, enabled: v })} />
          </div>
          <div>
            <Label>Pixel ID</Label>
            <Input value={metaPixel.pixel_id} onChange={(e) => setMetaPixel({ ...metaPixel, pixel_id: e.target.value })} placeholder="Enter your Meta Pixel ID" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
