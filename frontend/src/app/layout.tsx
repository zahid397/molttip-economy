import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { CanvasBackground } from '@/components/common/CanvasBackground';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MoltTip Economy',
  description: 'Tip creators, earn rewards. Web3 social tipping platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <CanvasBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
              {children}
            </main>
          </div>
          <Footer />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0a0a14',
              color: '#fff',
              border: '1px solid rgba(0,243,255,0.2)',
              backdropFilter: 'blur(8px)',
            },
            success: { iconTheme: { primary: '#00f3ff', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  );
}
