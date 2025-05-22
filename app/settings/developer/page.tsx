import Card from '@/components/ui/Card';

export default function DeveloperSettings() {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) + '…';

  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-semibold text-lg">Developer</h2>
      <p className="text-sm text-gray-600">
        Supabase service key (read-only):
      </p>
      <pre className="bg-gray-100 p-3 rounded text-xs select-all">{svcKey}</pre>
    </Card>
  );
} 