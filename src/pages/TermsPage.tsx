import { useStoreInfo } from '@/hooks/useSettings';

export default function TermsPage() {
  const storeInfo = useStoreInfo();

  return (
    <div className="min-h-screen">
      <div className="bg-secondary/50 py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p className="text-muted-foreground">
            Welcome to {storeInfo.name}. By using our website and services, you agree to these terms.
          </p>

          <h2 className="font-serif">General Terms</h2>
          <p className="text-muted-foreground">
            By placing an order through our website, you confirm that you are at least 18 years old 
            or have parental/guardian consent, and that you accept these terms and conditions.
          </p>

          <h2 className="font-serif">Products and Pricing</h2>
          <ul className="text-muted-foreground">
            <li>All product prices are listed in Bangladeshi Taka (BDT)</li>
            <li>We reserve the right to change prices without prior notice</li>
            <li>Product images are for illustration purposes; actual products may vary slightly</li>
            <li>We strive to maintain accurate stock levels, but availability cannot be guaranteed</li>
          </ul>

          <h2 className="font-serif">Orders and Payment</h2>
          <ul className="text-muted-foreground">
            <li>All orders are subject to availability and confirmation</li>
            <li>We currently accept Cash on Delivery (COD) only</li>
            <li>We reserve the right to refuse or cancel any order</li>
            <li>Order confirmation will be sent via phone call or SMS</li>
          </ul>

          <h2 className="font-serif">Delivery</h2>
          <ul className="text-muted-foreground">
            <li>Delivery times are estimates and not guaranteed</li>
            <li>We are not responsible for delays caused by courier services or circumstances beyond our control</li>
            <li>Please ensure accurate delivery information to avoid delays</li>
          </ul>

          <h2 className="font-serif">Returns and Refunds</h2>
          <p className="text-muted-foreground">
            Please refer to our <a href="/returns" className="text-primary">Return & Refund Policy</a> for 
            detailed information on returns and refunds.
          </p>

          <h2 className="font-serif">Intellectual Property</h2>
          <p className="text-muted-foreground">
            All content on this website, including images, text, and designs, are the property of 
            {storeInfo.name} and may not be used without permission.
          </p>

          <h2 className="font-serif">Limitation of Liability</h2>
          <p className="text-muted-foreground">
            {storeInfo.name} shall not be liable for any indirect, incidental, or consequential damages 
            arising from the use of our website or products.
          </p>

          <h2 className="font-serif">Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. Changes will be effective 
            immediately upon posting to this page.
          </p>

          <h2 className="font-serif">Contact Us</h2>
          <p className="text-muted-foreground">
            For any questions about these Terms of Service, please contact us at {storeInfo.email} or {storeInfo.phone}.
          </p>
        </div>
      </div>
    </div>
  );
}
