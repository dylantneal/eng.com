/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['three'],
  images: {
    domains: ['localhost', 'ewbopfohuxlhhddtptka.supabase.co', 'picsum.photos', 'robohash.org', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig; 