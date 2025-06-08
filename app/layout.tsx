import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'eng.com',
  description: 'Learn • Build • Share • Earn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add error boundary logging
  console.log("=== Layout rendering started ===");
  
  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased font-sans
                   bg-rainbow bg-[length:400%_400%]
                   animate-rainbow-drift animate-rainbow-hue"
      >
        <Providers>
          <Navbar />
          <main className="max-w-screen-lg mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
} 