import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDateTime, getStatusColor } from '@/utils/formatters';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .eq('customer_phone', phone.trim())
        .single();

      if (fetchError || !data) {
        setError('Order not found. Please check your order number and phone number.');
        setLoading(false);
        return;
      }

      setOrder(data as unknown as Order);

      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', data.id);

      setOrderItems((items || []) as unknown as OrderItem[]);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen">
      <div className="bg-secondary/50 py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order details to track your shipment</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-card rounded-xl shadow-card p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="ACS-XXXXXXXX-XXXX"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Searching...' : 'Track Order'} <Search className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center mb-8">
              {error}
            </div>
          )}

          {/* No Results */}
          {searched && !order && !error && !loading && (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No order found with these details.</p>
            </div>
          )}

          {/* Order Status */}
          {order && (
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-bold text-lg">{order.order_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Status Timeline */}
              {order.status !== 'cancelled' && order.status !== 'returned' && (
                <div className="mb-8">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-primary transition-all"
                      style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />

                    {/* Steps */}
                    {statusSteps.map((step, i) => (
                      <div key={step} className="relative flex flex-col items-center z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                            i <= currentStepIndex
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className="mt-2 text-xs capitalize text-muted-foreground hidden sm:block">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div className="border-t border-border pt-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                    <p className="font-medium">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                    <p className="font-medium">{order.customer_address}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-border pt-4">
                  <p className="font-medium mb-3">Order Items</p>
                  <div className="space-y-3">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {item.image_snapshot && (
                            <img
                              src={item.image_snapshot}
                              alt={item.title_snapshot}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{item.title_snapshot}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                          </div>
                        </div>
                        <span className="font-medium">{formatPrice(item.price_snapshot * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-border font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Continue Shopping */}
          <div className="text-center mt-8">
            <Link to="/shop" className="text-primary hover:underline inline-flex items-center">
              Continue Shopping <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
