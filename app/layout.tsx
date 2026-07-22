import type { Metadata } from 'next';
import '../src/index.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { Toaster } from 'react-hot-toast';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lashify Abuja | Premium Lash & Brow Studio',
  description: 'Premium Lash and Brow services in Abuja. Book your luxury appointment today. The best lash extensions, brow shaping, and tinting in the FCT.',
  keywords: [
    'Lashify Abuja', 'Lash studio Abuja', 'best lash extensions Abuja', 'brow services Abuja', 'eyelashes Abuja', 'microblading Abuja',
    'Asokoro', 'Maitama', 'Wuse', 'Wuse 2', 'Garki', 'Central Business District', 'CBD Abuja', 'Guzape',
    'Jabi', 'Utako', 'Mabushi', 'Wuye', 'Gudu', 'Durumi', 'Dakibiyu', 'Kaura', 'Duboyi', 'Gaduwa',
    'Gwarinpa', 'Galadimawa', 'Lokogoma', 'Kabusa', 'Life Camp', 'Dawaki', 'Kubwa',
    'Karu', 'Nyanya', 'Lugbe', 'Kuje', 'AMAC', 'Bwari', 'Gwagwalada', 'Kwali', 'Abaji',
    'Katampe', 'Katampe Extension', 'Dutse', 'Dakwo', 'Nbora', 'Mpape', 'Kurudu', 'Jikwoyi', 'Karshi',
    'Aminu Kano Crescent', 'Adetokunbo Ademola Crescent', 'Aguiyi Ironsi', '1st Avenue Gwarinpa', '3rd Avenue Gwarinpa'
  ],
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