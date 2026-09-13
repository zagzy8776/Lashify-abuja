'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, ExternalLink, RefreshCw, Search, BarChart3, Globe2 } from 'lucide-react';

type Audit = {
  site: { name: string; url: string };
  score: number;
  checks: { key: string; label: string; ok: boolean; detail: string }[];
  coverage: { publicRoutes: number; activeServices: number; galleryItems: number; publishedReviews: number; totalAppointments: number };
  generatedAt: string;
};

export default function SeoDashboard() {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/seo', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load SEO audit');
      setAudit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SEO audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="py-20 flex justify-center"><RefreshCw className="w-7 h-7 animate-spin text-rose-500" /></div>;
  }

  if (error || !audit) {
    return <div className="bg-white rounded-2xl p-6 border border-red-100 text-red-600">{error || 'SEO audit unavailable'}</div>;
  }

  const scoreLabel = audit.score >= 90 ? 'Excellent' : audit.score >= 75 ? 'Good' : audit.score >= 50 ? 'Needs attention' : 'Critical';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">SEO & Analytics Center</h2>
          <p className="text-sm text-gray-500 mt-1">Technical SEO health, indexation controls and content coverage.</p>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh audit
        </button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <div className="rounded-2xl bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-black text-gray-900">{audit.score}</div>
          <div className="text-sm font-bold text-rose-500 mt-1">/ 100</div>
          <div className="mt-3 text-xs font-extrabold uppercase tracking-wider text-gray-500">{scoreLabel}</div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric icon={Globe2} label="Indexed routes" value={audit.coverage.publicRoutes} />
          <Metric icon={Search} label="Active services" value={audit.coverage.activeServices} />
          <Metric icon={BarChart3} label="Gallery items" value={audit.coverage.galleryItems} />
          <Metric icon={CheckCircle2} label="Published reviews" value={audit.coverage.publishedReviews} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900">Technical SEO checklist</h3>
          <p className="text-sm text-gray-500 mt-1">These checks are generated from the production configuration.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {audit.checks.map((check) => (
            <div key={check.key} className="p-5 flex items-start gap-4">
              {check.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" /> : <CircleAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />}
              <div className="min-w-0">
                <div className="font-bold text-gray-900">{check.label}</div>
                <p className="text-sm text-gray-500 mt-1 break-words">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <a href={`${audit.site.url}/sitemap.xml`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between hover:border-rose-200">
          <div><div className="font-bold text-gray-900">Open XML sitemap</div><div className="text-sm text-gray-500 mt-1">Submit this URL to Google Search Console.</div></div>
          <ExternalLink className="w-5 h-5 text-gray-400" />
        </a>
        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between hover:border-rose-200">
          <div><div className="font-bold text-gray-900">Google Search Console</div><div className="text-sm text-gray-500 mt-1">Monitor indexing, queries, clicks and Core Web Vitals.</div></div>
          <ExternalLink className="w-5 h-5 text-gray-400" />
        </a>
      </div>

      <p className="text-xs text-gray-400">Audit generated {new Date(audit.generatedAt).toLocaleString()}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5">
      <Icon className="w-5 h-5 text-rose-500" />
      <div className="text-2xl font-black text-gray-900 mt-3">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mt-1">{label}</div>
    </div>
  );
}
