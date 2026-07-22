"use client";
import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { fetchReviews, type Review } from '../lib/api';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchReviews();
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
      setLoading(false);
    };
    loadReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="py-24 section-cream relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(179, 139, 158, 0.04) 0%, transparent 70%)' }} />

      <div className="container-lux relative z-10">
        <div className="divider-gold mb-16" />
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-label">
            <span className="w-8 h-px" style={{ background: 'rgba(179, 139, 158, 0.5)' }} />
            Client Love
            <span className="w-8 h-px" style={{ background: 'rgba(179, 139, 158, 0.5)' }} />
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl mt-4" style={{ color: '#3d2e36' }}>
            Words From Our
            <br />
            <span className="italic" style={{ color: '#b38b9e' }}>Clients</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div key={review.id} className="card-lux p-7 hover:-translate-y-1"
              style={{ animationDelay: `${idx * 0.1}s` }}>
              <Quote className="w-8 h-8 mb-4" style={{ color: 'rgba(179, 139, 158, 0.3)' }} />
              <div className="flex gap-0.5 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{ fill: '#b38b9e', color: '#b38b9e' }} />
                ))}
              </div>
              <p className="leading-relaxed mb-6 text-sm" style={{ color: '#5a4850' }}>
                "{review.comment}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(179, 139, 158, 0.08)', border: '1px solid rgba(179, 139, 158, 0.2)' }}>
                  <span className="font-serif text-lg" style={{ color: '#b38b9e' }}>
                    {review.client_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm" style={{ color: '#3d2e36' }}>{review.client_name}</div>
                  <div className="text-xs" style={{ color: '#8f7882' }}>Verified Client</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

