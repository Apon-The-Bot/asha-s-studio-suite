import { useStoreInfo } from '@/hooks/useSettings';

export default function PrivacyPage() {
  const storeInfo = useStoreInfo();

  return (
    <div className="min-h-screen">
      <div className="bg-secondary/50 py-8 md:py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p className="text-muted-foreground">
            At {storeInfo.name}, we respect your privacy and are committed to protecting your personal information.
          </p>

          <h2 className="font-serif">Information We Collect</h2>
          <p className="text-muted-foreground">When you place an order, we collect:</p>
          <ul className="text-muted-foreground">
            <li>Name and contact information (phone, email)</li>
            <li>Delivery address</li>
            <li>Order details and preferences</li>
          </ul>

          <h2 className="font-serif">How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to:</p>
          <ul className="text-muted-foreground">
            <li>Process and deliver your orders</li>
            <li>Send order confirmations and updates</li>
            <li>Respond to your inquiries</li>
            <li>Improve our products and services</li>
          </ul>

          <h2 className="font-serif">Information Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your personal information from 
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="font-serif">Third-Party Services</h2>
          <p className="text-muted-foreground">
            We may use third-party services (such as delivery partners) to fulfill your orders. 
            These partners only receive the information necessary to complete their services.
          </p>

          <h2 className="font-serif">Cookies and Analytics</h2>
          <p className="text-muted-foreground">
            We may use cookies and analytics tools (such as Meta Pixel) to understand how visitors 
            interact with our website and to improve our services.
          </p>

          <h2 className="font-serif">Your Rights</h2>
          <p className="text-muted-foreground">You have the right to:</p>
          <ul className="text-muted-foreground">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2 className="font-serif">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at {storeInfo.email} or {storeInfo.phone}.
          </p>
        </div>
      </div>
    </div>
  );
}
