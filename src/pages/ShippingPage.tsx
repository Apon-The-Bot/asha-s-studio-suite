import { useStoreInfo, useDeliveryCharges, useSettings } from '@/hooks/useSettings';
import { formatPrice } from '@/utils/formatters';

export default function ShippingPage() {
  const storeInfo = useStoreInfo();
  const deliveryCharges = useDeliveryCharges();
  const { data: settings } = useSettings();

  return (
    <div className="min-h-screen">
      <div className="bg-secondary/50 py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Shipping Policy</h1>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-muted-foreground">
            At {storeInfo.name}, we strive to deliver your orders as quickly and safely as possible.
          </p>

          <h2 className="font-serif">Delivery Charges</h2>
          <ul className="text-muted-foreground">
            <li>Inside Dhaka: <strong>{formatPrice(deliveryCharges.inside_city)}</strong></li>
            <li>Outside Dhaka: <strong>{formatPrice(deliveryCharges.outside_city)}</strong></li>
            <li className="text-success">Free shipping on orders over <strong>{formatPrice(deliveryCharges.free_shipping_threshold)}</strong>!</li>
          </ul>

          <h2 className="font-serif">Delivery Time</h2>
          <p className="text-muted-foreground">
            {settings?.policies?.shipping_info || 'Orders are processed within 1-2 business days. Delivery takes 3-5 days inside Dhaka and 5-7 days outside.'}
          </p>

          <h2 className="font-serif">Order Processing</h2>
          <p className="text-muted-foreground">
            Orders are processed within 1-2 business days (excluding weekends and public holidays). 
            You will receive a confirmation call/SMS once your order is dispatched.
          </p>

          <h2 className="font-serif">Tracking Your Order</h2>
          <p className="text-muted-foreground">
            You can track your order using your order number and phone number on our 
            <a href="/track-order" className="text-primary"> Track Order</a> page.
          </p>

          <h2 className="font-serif">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about shipping, please contact us at {storeInfo.phone} or {storeInfo.email}.
          </p>
        </div>
      </div>
    </div>
  );
}
