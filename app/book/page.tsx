import type { Metadata } from 'next';
import { Suspense } from 'react';
import Booking from '../../src/components/Booking';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Book your Lashify Abuja beauty appointment.',
  robots: { index: false, follow: false },
};

export default function BookPage() {
  return (
    <div className="pt-20">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#b38b9e' }} />
        </div>
      }>
        <Booking />
      </Suspense>
    </div>
  );
}
