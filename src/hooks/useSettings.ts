import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StoreSettings, DeliveryCharges, MetaPixelSettings, PolicySettings } from '@/types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const settings: Record<string, unknown> = {};
      data?.forEach(item => {
        settings[item.key] = item.value;
      });

      return {
        storeInfo: settings.store_info as StoreSettings | undefined,
        deliveryCharges: settings.delivery_charges as DeliveryCharges | undefined,
        metaPixel: settings.meta_pixel as MetaPixelSettings | undefined,
        policies: settings.policies as PolicySettings | undefined,
      };
    },
  });
}

export function useStoreInfo() {
  const { data } = useSettings();
  return data?.storeInfo ?? {
    name: "Asha's Craft Studio",
    phone: '+880-1234567890',
    whatsapp: 'https://wa.me/8801234567890',
    email: 'info@ashascraftstudio.com',
    address: 'Dhaka, Bangladesh'
  };
}

export function useDeliveryCharges() {
  const { data } = useSettings();
  return data?.deliveryCharges ?? {
    inside_city: 60,
    outside_city: 120,
    free_shipping_threshold: 2000
  };
}

export function useMetaPixel() {
  const { data } = useSettings();
  return data?.metaPixel ?? { enabled: false, pixel_id: '' };
}
