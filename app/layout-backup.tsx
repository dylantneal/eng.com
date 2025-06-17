import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'eng.com - Engineering Community',
  description: 'A platform for engineers to collaborate, share projects, and learn together',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Add error boundary logging
  console.log("=== Layout rendering started ===");
  
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased font-sans bg-gray-900`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
} 