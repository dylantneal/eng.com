import Card from '@/components/ui/Card';

export default function BillingTab() {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Billing</h1>

      {/* Stripe's Customer-Portal URL is returned by your backend; plug it in here */}
      <iframe
        src="/api/stripe/customer-portal"
        className="w-full h-[800px] rounded border"
      />
    </div>
  );
} 