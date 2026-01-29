import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { useStoreInfo } from '@/hooks/useSettings';
import { motion } from 'framer-motion';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const storeInfo = useStoreInfo();

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) return;

      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error || !orderData) {
        setLoading(false);
        return;
      }

      // Type assertion to handle database types
      setOrder(orderData as unknown as Order);

      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);

      setOrderItems((items || []) as unknown as OrderItem[]);
      setLoading(false);
    }

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find this order.</p>
        <Link to="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-8 md:py-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll contact you soon to confirm.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card rounded-xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-bold text-lg">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDateTime(order.created_at)}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 border-b border-border pb-4 mb-4">
              {orderItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image_snapshot && (
                    <img
                      src={item.image_snapshot}
                      alt={item.title_snapshot}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title_snapshot}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(item.price_snapshot * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>{order.delivery_charge === 0 ? 'FREE' : formatPrice(order.delivery_charge)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 p-4 bg-secondary rounded-lg">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{order.customer_address}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {order.customer_phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={`/track-order?order=${order.order_number}&phone=${order.customer_phone}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" /> Track Order
              </Button>
            </Link>
            <a href={storeInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" /> Need Help?
              </Button>
            </a>
          </div>

          {/* Continue Shopping */}
          <div className="text-center mt-8">
            <Link to="/shop" className="text-primary hover:underline">
              Continue Shopping →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
