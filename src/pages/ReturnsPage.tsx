import { useStoreInfo, useSettings } from '@/hooks/useSettings';

export default function ReturnsPage() {
  const storeInfo = useStoreInfo();
  const { data: settings } = useSettings();
  const returnDays = settings?.policies?.return_days || 7;

  return (
    <div className="min-h-screen">
      <div className="bg-secondary/50 py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Return & Refund Policy</h1>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-muted-foreground">
            Your satisfaction is our priority. If you're not completely happy with your purchase, 
            we're here to help.
          </p>

          <h2 className="font-serif">Return Period</h2>
          <p className="text-muted-foreground">
            You have <strong>{returnDays} days</strong> from the date of delivery to return your item(s).
          </p>

          <h2 className="font-serif">Return Conditions</h2>
          <p className="text-muted-foreground">To be eligible for a return:</p>
          <ul className="text-muted-foreground">
            <li>Items must be unused and in the same condition as received</li>
            <li>Items must be in the original packaging</li>
            <li>You must have the order receipt or proof of purchase</li>
            <li>Items must not be damaged due to misuse</li>
          </ul>

          <h2 className="font-serif">Non-Returnable Items</h2>
          <p className="text-muted-foreground">The following items cannot be returned:</p>
          <ul className="text-muted-foreground">
            <li>Items marked as "Final Sale" or "Non-Returnable"</li>
            <li>Customized or personalized items</li>
            <li>Items damaged due to customer misuse</li>
          </ul>

          <h2 className="font-serif">How to Return</h2>
          <ol className="text-muted-foreground">
            <li>Contact us at {storeInfo.phone} or {storeInfo.email} with your order number</li>
            <li>We'll provide you with return instructions</li>
            <li>Pack the item securely and ship it back to us</li>
            <li>Once we receive and inspect the item, we'll process your refund</li>
          </ol>

          <h2 className="font-serif">Refund Process</h2>
          <p className="text-muted-foreground">
            Refunds will be processed within 5-7 business days after we receive the returned item. 
            For COD orders, refunds will be made via bank transfer or mobile banking (bKash/Nagad).
          </p>

          <h2 className="font-serif">Exchange</h2>
          <p className="text-muted-foreground">
            If you'd like to exchange an item for a different size or color, please contact us and 
            we'll be happy to assist you.
          </p>

          <h2 className="font-serif">Contact Us</h2>
          <p className="text-muted-foreground">
            For any questions about returns, please reach out to us at {storeInfo.phone} or {storeInfo.email}.
          </p>
        </div>
      </div>
    </div>
  );
}
