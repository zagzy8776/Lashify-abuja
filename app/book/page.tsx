import { Suspense } from 'react';
import Booking from '../../src/components/Booking';
import Navbar from '../../src/components/Navbar';
import Footer from '../../src/components/Footer';
import { Loader2 } from 'lucide-react';

export default function BookPage() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#b38b9e' }} />
          </div>
        }>
          <Booking />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
