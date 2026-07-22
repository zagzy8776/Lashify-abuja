"use client";
import { useEffect, useState } from 'react';
import { fetchGallery, type GalleryItem } from '../lib/api';
import { X, ZoomIn } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  all: 'All Work',
  'lash': 'Lash',
  'brows': 'Brows',
  'lash-refill': 'Lash Refill',
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await fetchGallery();
        // Only use real Cloudinary-uploaded images
        const validItems = data?.filter(item =>
          item.image_url &&
          item.image_url.includes('cloudinary') &&
          (item.category === 'lash' || item.category === 'brows' || item.category === 'lash-refill')
        );
        setItems(validItems || []);
      } catch (err) {
        setItems([]);
      }
      setLoading(false);
    };
    loadGallery();
  }, []);

  // Handle escape key for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightbox) {
        setLightbox(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);
  const categories = ['all', 'lash', 'brows', 'lash-refill'];

  if (loading) {
    return (
      <section className="py-24 section-blush">
        <div className="container-lux">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl shimmer-dark" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 section-blush">
      <div className="container-lux">
        <div className="divider-gold mb-16" />

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label">
            <span className="w-8 h-px" style={{ background: 'rgba(179, 139, 158, 0.5)' }} />
            Portfolio
            <span className="w-8 h-px" style={{ background: 'rgba(179, 139, 158, 0.5)' }} />
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl mt-4 mb-5" style={{ color: '#3d2e36' }}>
            The
            <br />
            <span className="italic" style={{ color: '#b38b9e' }}>Gallery</span>
          </h2>
          <p className="text-sm" style={{ color: '#5a4850' }}>Real results from real clients.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300"
              style={{
                background: filter === cat ? '#b38b9e' : 'transparent',
                color: filter === cat ? '#faf7f2' : '#5a4850',
                border: `1px solid ${filter === cat ? '#b38b9e' : 'rgba(179, 139, 158, 0.4)'}`,
              }}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-serif mb-2" style={{ color: '#b38b9e' }}>Coming Soon</p>
            <p className="text-sm" style={{ color: '#5a4850' }}>Our gallery is being curated. Check back soon to see our beautiful work!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-serif mb-2" style={{ color: '#b38b9e' }}>No photos found</p>
            <p className="text-sm" style={{ color: '#5a4850' }}>There are currently no photos in the {categoryLabels[filter] || filter} category.</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                idx % 5 === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'
              }`}
              style={{ border: '1px solid rgba(179, 139, 158, 0.15)' }}
            >
              <img
                src={item.image_url}
                alt={item.title}
                loading={idx < 4 ? 'eager' : 'lazy'}
                decoding="async"
                width="400"
                height="400"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ filter: 'brightness(0.8) saturate(0.9)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/category-lash.jpg'; // fallback
                }}
              />
              <div className="absolute inset-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(to top, rgba(250, 247, 242, 0.9) 0%, rgba(179, 139, 158, 0.1) 60%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 sm:translate-y-4 sm:group-hover:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-base sm:text-lg" style={{ color: '#3d2e36' }}>{item.title}</h4>
                    <span className="text-xs uppercase tracking-wider" style={{ color: '#b38b9e' }}>
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(250, 247, 242, 0.68)', border: '1px solid rgba(179, 139, 158, 0.2)', backdropFilter: 'blur(4px)' }}>
                    <ZoomIn className="w-4 h-4" style={{ color: '#b38b9e' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in"
          style={{ background: 'rgba(250, 247, 242, 0.97)', backdropFilter: 'blur(12px)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(179, 139, 158, 0.12)', border: '1px solid rgba(179, 139, 158, 0.2)' }}
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" style={{ color: '#b38b9e' }} />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt={lightbox.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/category-lash.jpg';
              }}
            />
            <div className="text-center mt-6">
              <h3 className="font-serif text-2xl" style={{ color: '#3d2e36' }}>{lightbox.title}</h3>
              {lightbox.description && (
                <p className="mt-2" style={{ color: '#5a4850' }}>{lightbox.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
