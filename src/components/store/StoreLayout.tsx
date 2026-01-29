import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import WhatsAppButton from './WhatsAppButton';
import { useMetaPixel } from '@/hooks/useSettings';
import { initMetaPixel, trackPageView } from '@/utils/metaPixel';

export default function StoreLayout() {
  const location = useLocation();
  const metaPixel = useMetaPixel();

  // Initialize Meta Pixel
  useEffect(() => {
    if (metaPixel.enabled && metaPixel.pixel_id) {
      initMetaPixel(metaPixel.pixel_id);
    }
  }, [metaPixel.enabled, metaPixel.pixel_id]);

  // Track page views
  useEffect(() => {
    if (metaPixel.enabled && metaPixel.pixel_id) {
      trackPageView();
    }
  }, [location.pathname, metaPixel.enabled, metaPixel.pixel_id]);

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <WhatsAppButton />
    </div>
  );
}
