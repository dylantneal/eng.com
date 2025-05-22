import Card from '@/components/ui/Card';

export default async function BillingSettings() {
  // In a real app you would create / fetch a portal session URL server-side
  const portalUrl = process.env.STRIPE_PORTAL_URL ?? 'https://billing.stripe.com/test_123';

  return (
    <Card className="p-0 overflow-hidden">
      <iframe
        src={portalUrl}
        className="w-full h-[720px] border-0"
        title="Stripe Customer Portal"
      />
    </Card>
  );
} 