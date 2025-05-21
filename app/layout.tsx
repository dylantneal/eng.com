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
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <Navbar />
          <main className="container px-4 mx-auto py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
} 