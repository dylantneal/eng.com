'use client';

import { useState, useEffect } from 'react';

export default function SimpleCommunityTest() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    console.log('Simple test useEffect triggered');
    
    const loadData = async () => {
      try {
        console.log('Fetching data...');
        const response = await fetch('/api/communities');
        console.log('Response:', response.status);
        const result = await response.json();
        console.log('Data:', result);
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  console.log('Render - loading:', loading, 'data:', data);

  if (loading) {
    return <div>Loading test...</div>;
  }

  return (
    <div>
      <h1>Simple Test</h1>
      <p>Data loaded: {data ? data.length : 0} items</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
} 