// Meta Pixel event tracking utility
// Implements deduplication to prevent duplicate events

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

let pixelId: string | null = null;
let isInitialized = false;
const firedEvents = new Set<string>();

export function initMetaPixel(id: string) {
  if (!id || isInitialized) return;

  pixelId = id;

  // Initialize Facebook Pixel
  (function(f: Window, b: Document, e: string, v: string) {
    const n: unknown = (f.fbq = function() {
      // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
      (n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (n as any).push = n;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (n as any).loaded = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (n as any).version = '2.0';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (n as any).queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', id);
  isInitialized = true;
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function trackEvent(eventName: string, params: Record<string, unknown> = {}, eventId?: string) {
  if (!isInitialized || !window.fbq) return;

  const id = eventId || generateEventId();
  const dedupeKey = `${eventName}-${id}`;

  // Prevent duplicate events
  if (firedEvents.has(dedupeKey)) return;
  firedEvents.add(dedupeKey);

  // Clean up old events (keep last 100)
  if (firedEvents.size > 100) {
    const arr = Array.from(firedEvents);
    arr.slice(0, 50).forEach(key => firedEvents.delete(key));
  }

  window.fbq('track', eventName, { ...params, event_id: id });
}

export function trackPageView() {
  trackEvent('PageView');
}

export function trackViewContent(params: {
  productId: string;
  productName: string;
  price: number;
  category?: string;
}) {
  trackEvent('ViewContent', {
    content_type: 'product',
    content_ids: [params.productId],
    content_name: params.productName,
    value: params.price,
    currency: 'BDT',
    content_category: params.category,
  });
}

export function trackAddToCart(params: {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}) {
  trackEvent('AddToCart', {
    content_type: 'product',
    content_ids: [params.productId],
    content_name: params.productName,
    value: params.price * params.quantity,
    currency: 'BDT',
    num_items: params.quantity,
  });
}

export function trackInitiateCheckout(params: {
  value: number;
  numItems: number;
  contentIds: string[];
}) {
  trackEvent('InitiateCheckout', {
    content_type: 'product',
    content_ids: params.contentIds,
    value: params.value,
    currency: 'BDT',
    num_items: params.numItems,
  });
}

export function trackPurchase(params: {
  orderId: string;
  value: number;
  contentIds: string[];
}) {
  trackEvent('Purchase', {
    content_type: 'product',
    content_ids: params.contentIds,
    value: params.value,
    currency: 'BDT',
    order_id: params.orderId,
  }, params.orderId); // Use orderId as eventId for deduplication
}
