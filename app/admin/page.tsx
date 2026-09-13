import Link from 'next/link';
import { Search } from 'lucide-react';
import Admin from '../../src/components/Admin';

export default function AdminPage() {
  return (
    <>
      <Admin />
      <Link
        href="/admin/seo"
        className="fixed bottom-6 right-6 z-[120] inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-extrabold text-white shadow-xl hover:bg-gray-800 transition-colors"
      >
        <Search className="w-4 h-4" /> SEO Center
      </Link>
    </>
  );
}
