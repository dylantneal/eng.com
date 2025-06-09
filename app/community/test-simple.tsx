'use client';

import { useState, useEffect } from 'react';

export default function TestCommunityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching...');
        setLoading(true);
        const response = await fetch('/api/communities');
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Result:', result);
        setData(result);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Communities</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
} 