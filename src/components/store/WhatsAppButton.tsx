import { MessageCircle } from 'lucide-react';
import { useStoreInfo } from '@/hooks/useSettings';

export default function WhatsAppButton() {
  const storeInfo = useStoreInfo();

  return (
    <a
      href={storeInfo.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
