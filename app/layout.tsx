import type { Metadata } from 'next';
import '../src/index.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Lashify Abuja',
  description: 'Premium Lash and Brow services in Abuja. Book your luxury appointment today.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[#faf5f0]" style={{ backgroundColor: '#faf5f0' }}>
        <Toaster position="bottom-right" />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
