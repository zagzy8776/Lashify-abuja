import { useEffect, useState } from 'react';
import { fetchGallery, type GalleryItem } from '../lib/supabase';
import { X, ZoomIn } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  all: 'All Work',
  lashes: 'Lashes',
  brows: 'Brows',
  other: 'Other',
};

const fallbackImages = [
  { url: 'https://images.pexels.com/photos/3997389/pexels-photo-3997389.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'lashes', title: 'Classic Set' },
  { url: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'lashes', title: 'Volume Set' },
  { url: 'https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'lashes', title: 'Hybrid Set' },
  { url: 'https://images.pexels.com/photos/3997381/pexels-photo-3997381.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'brows', title: 'Brow Lamination' },
  { url: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'lashes', title: 'Mega Volume' },
  { url: 'https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'brows', title: 'Brow Shaping' },
  { url: 'https://images.pexels.com/photos/3997387/pexels-photo-3997387.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'lashes', title: 'Lash Refill' },
  { url: 'https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=800', cat: 'other', title: 'Combo Set' },
];

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await fetchGallery();
        if (data && data.length > 0) {
          setItems(data);
        } else {
          const fallback: GalleryItem[] = fallbackImages.map((f, i) => ({
            id: `fallback-${i}`,
            title: f.title,
            category: f.cat,
            image_url: f.url,
            description: null,
            is_featured: i < 3,
            sort_order: i,
            created_at: new Date().toISOString(),
          }));
          setItems(fallback);
        }
      } catch (err) {
        console.error('Failed to fetch gallery:', err);
        const fallback: GalleryItem[] = fallbackImages.map((f, i) => ({
          id: `fallback-${i}`,
          title: f.title,
          category: f.cat,
          image_url: f.url,
          description: null,
          is_featured: i < 3,
          sort_order: i,
          created_at: new Date().toISOString(),
        }));
        setItems(fallback);
      }
      setLoading(false);
    };
    loadGallery();
  }, []);

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);
  const categories = ['all', 'lashes', 'brows', 'other'];

  if (loading) {
    return (
      <section className="py-24 section-mid">
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
    <section className="py-24 section-mid">
      <div className="container-lux">
        <div className="divider-gold mb-16" />

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label">
            <span className="w-8 h-px" style={{ background: 'rgba(212,168,39,0.5)' }} />
            Portfolio
            <span className="w-8 h-px" style={{ background: 'rgba(212,168,39,0.5)' }} />
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl mt-4 mb-5" style={{ color: '#f9f1e8' }}>
            The
            <br />
            <span className="italic" style={{ color: '#d4a827' }}>Gallery</span>
          </h2>
          <p className="text-sm" style={{ color: '#6b5238' }}>Real results from real clients.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300"
              style={{
                background: filter === cat ? '#d4a827' : 'rgba(255,255,255,0.04)',
                color: filter === cat ? '#0a0806' : '#6b5238',
                border: `1px solid ${filter === cat ? '#d4a827' : 'rgba(212,168,39,0.15)'}`,
              }}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                idx % 5 === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'
              }`}
              style={{ border: '1px solid rgba(212,168,39,0.08)' }}
            >
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ filter: 'brightness(0.8) saturate(0.9)' }}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.9) 0%, rgba(10,8,6,0.2) 60%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg" style={{ color: '#f9f1e8' }}>{item.title}</h4>
                    <span className="text-xs uppercase tracking-wider" style={{ color: '#d4a827' }}>
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
                    <ZoomIn className="w-4 h-4" style={{ color: '#f9f1e8' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in"
          style={{ background: 'rgba(10,8,6,0.97)', backdropFilter: 'blur(12px)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" style={{ color: '#f9f1e8' }} />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt={lightbox.title}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="text-center mt-6">
              <h3 className="font-serif text-2xl" style={{ color: '#f9f1e8' }}>{lightbox.title}</h3>
              {lightbox.description && (
                <p className="mt-2" style={{ color: '#6b5238' }}>{lightbox.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
