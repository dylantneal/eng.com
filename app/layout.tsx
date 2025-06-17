import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'eng.com - Engineering Community',
  description: 'A platform for engineers to collaborate, share projects, and learn together',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 text-white">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
} 