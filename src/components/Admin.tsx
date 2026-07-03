import { useEffect, useState } from 'react';
import {
  Lock, Loader2, Calendar, Users, DollarSign, TrendingUp,
  Clock, Check, X, Phone, Mail, ChevronRight, LogOut,
  Scissors, Star, Image as ImageIcon, Plus, Pencil, Trash2
} from 'lucide-react';
import {
  adminLogin, adminLogout, isAdminAuthenticated,
  adminFetchAllAppointments, adminFetchAllServices,
  adminUpdateService, adminCreateService, adminDeleteService, updateAppointmentStatus,
  adminFetchGallery, adminAddGalleryItem, adminDeleteGalleryItem,
  adminFetchReviews, adminUpdateReview, adminDeleteReview,
  type Service, type Appointment, type AppointmentStatus
} from '../lib/supabase';
import {
  formatNaira, formatDuration, formatTime, DAYS_SHORT
} from '../lib/utils';

type Props = {
  onNavigate: (page: string) => void;
};

type Tab = 'overview' | 'appointments' | 'services' | 'gallery' | 'reviews';

export default function Admin({ onNavigate }: Props) {
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    setSession(isAdminAuthenticated());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const result = await adminLogin(email.trim(), password);
    if (result.error) {
      setLoginError(result.error);
    } else {
      setSession(true);
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await adminLogout();
    setSession(false);
    onNavigate('home');
  };



  if (session === null) {
    return (
      <div className="pt-32 pb-24 min-h-screen section-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#cd738d' }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="pt-32 pb-24 min-h-screen section-light flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden" style={{ border: '1px solid rgba(205,115,141,0.3)', background: 'rgba(205,115,141,0.08)' }}>
              <Lock className="w-8 h-8" style={{ color: '#cd738d' }} />
            </div>
            <h1 className="font-serif text-3xl" style={{ color: '#371c14' }}>Admin Portal</h1>
            <p className="text-sm mt-2" style={{ color: '#39383b' }}>Sign in to manage LashifyAbuja</p>
          </div>

          <form onSubmit={handleLogin} className="rounded-2xl p-8" style={{ background: 'rgba(27,26,28,0.8)', border: '1px solid rgba(205,115,141,0.15)' }}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-lux"
                placeholder="admin@lashifyabuja.com"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-lux"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm mb-4 text-center" style={{ color: 'rgba(200,80,80,0.8)' }}>{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full btn-gold disabled:opacity-60"
            >
              {loggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="w-full text-center text-sm mt-6 transition-colors" style={{ color: '#2d2c2f' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#cd738d')} onMouseLeave={(e) => (e.currentTarget.style.color = '#2d2c2f')}
          >
            ← Back to website
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAuth = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) onLogout();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptData, svcData] = await Promise.all([
          adminFetchAllAppointments(),
          adminFetchAllServices(),
        ]);
        setAppointments(apptData);
        setServices(svcData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        checkAuth(err);
      }
      setLoading(false);
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAppointments = async () => {
    try {
      const data = await adminFetchAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to refresh appointments:', err);
      checkAuth(err);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, status);
      refreshAppointments();
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  };

  const toggleServiceActive = async (id: string, isActive: boolean) => {
    try {
      await adminUpdateService(id, { is_active: !isActive });
      setServices(services.map((s) => s.id === id ? { ...s, is_active: !isActive } : s));
    } catch (err) {
      console.error('Failed to toggle service:', err);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'services', label: 'Services', icon: Scissors },
    { key: 'gallery', label: 'Gallery', icon: ImageIcon },
    { key: 'reviews', label: 'Reviews', icon: Star },
  ];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const upcomingAppointments = appointments
    .filter((a) => a.appointment_date >= todayStr && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.start_time.localeCompare(b.start_time));
  const totalRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + Number(a.service_price), 0);
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen section-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#cd738d' }} />
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen section-light">
      <div className="container-lux py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl" style={{ color: '#371c14' }}>Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#39383b' }}>Welcome back, Lashify</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm transition-colors" style={{ color: '#6a686c' }}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: tab === t.key ? '#cd738d' : 'rgba(255,255,255,0.03)',
                color: tab === t.key ? '#151416' : '#6a686c',
                border: `1px solid ${tab === t.key ? '#cd738d' : 'rgba(205,115,141,0.1)'}`,
              }}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Calendar} label="Today's Appointments" value={todayAppointments.length.toString()} color="gold" />
              <StatCard icon={Clock} label="Pending Requests" value={pendingCount.toString()} color="rose" />
              <StatCard icon={Users} label="Total Bookings" value={appointments.length.toString()} color="ink" />
              <StatCard icon={DollarSign} label="Revenue (Completed)" value={formatNaira(totalRevenue)} color="green" />
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
              <h3 className="font-serif text-xl mb-5" style={{ color: '#371c14' }}>Upcoming Appointments</h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: '#39383b' }}>No upcoming appointments.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map((apt) => (
                    <AppointmentRow
                      key={apt.id}
                      apt={apt}
                      onStatusChange={handleUpdateAppointmentStatus}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
            <h3 className="font-serif text-xl mb-5" style={{ color: '#371c14' }}>All Appointments</h3>
            {appointments.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: '#39383b' }}>No appointments yet.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <AppointmentRow
                    key={apt.id}
                    apt={apt}
                    onStatusChange={handleUpdateAppointmentStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'services' && (
          <ServicesManager
            services={services}
            setServices={setServices}
            toggleServiceActive={toggleServiceActive}
            checkAuth={checkAuth}
          />
        )}

        {tab === 'gallery' && <GalleryManager />}
        {tab === 'reviews' && <ReviewsManager />}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Calendar;
  label: string;
  value: string;
  color: 'gold' | 'rose' | 'ink' | 'green';
}) {
  const iconColors: Record<string, string> = { gold: '#cd738d', rose: 'rgba(200,80,80,0.8)', ink: '#989599', green: '#6be06b' };
  return (
    <div className="bg-white rounded-2xl p-5" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`}
        style={{ background: 'rgba(205,115,141,0.08)', border: '1px solid rgba(205,115,141,0.15)' }}>
        <Icon className="w-5 h-5" style={{ color: iconColors[color] }} />
      </div>
      <div className="font-serif text-2xl" style={{ color: '#371c14' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: '#39383b' }}>{label}</div>
    </div>
  );
}

function AppointmentRow({ apt, onStatusChange, compact }: {
  apt: Appointment;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, { bg: string; color: string }> = {
    pending:   { bg: 'rgba(205,115,141,0.1)',  color: '#cd738d' },
    confirmed: { bg: 'rgba(60,120,200,0.1)',  color: '#7ab0f0' },
    completed: { bg: 'rgba(60,180,60,0.1)',   color: '#6be06b' },
    cancelled: { bg: 'rgba(200,60,60,0.1)',   color: 'rgba(200,80,80,0.8)' },
    no_show:   { bg: 'rgba(255,255,255,0.05)', color: '#39383b' },
  };

  const date = new Date(apt.appointment_date + 'T00:00:00');

  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,115,141,0.08)' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-grow">
          <div className="text-center shrink-0">
            <div className="text-xs uppercase" style={{ color: '#39383b' }}>{DAYS_SHORT[date.getDay()]}</div>
            <div className="font-serif text-2xl" style={{ color: '#371c14' }}>{date.getDate()}</div>
            <div className="text-xs" style={{ color: '#39383b' }}>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-ink-900 truncate">{apt.service_name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[apt.status]}`}>
                {apt.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#6a686c' }}>{apt.client_name} · {formatTime(apt.start_time)}</p>
            {!compact && (
              <p className="text-xs mt-1" style={{ color: '#39383b' }}>{formatNaira(Number(apt.service_price))}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {apt.status === 'pending' && (
            <button
              onClick={() => onStatusChange(apt.id, 'confirmed')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(60,120,200,0.1)', color: '#7ab0f0', border: '1px solid rgba(60,120,200,0.2)' }}
            >
              Confirm
            </button>
          )}
          {(apt.status === 'pending' || apt.status === 'confirmed') && (
            <button
              onClick={() => onStatusChange(apt.id, 'completed')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(60,180,60,0.1)', color: '#6be06b', border: '1px solid rgba(60,180,60,0.2)' }}
            >
              <Check className="w-3.5 h-3.5 inline" /> Done
            </button>
          )}
          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
            <button
              onClick={() => onStatusChange(apt.id, 'cancelled')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(200,60,60,0.1)', color: 'rgba(200,80,80,0.8)', border: '1px solid rgba(200,60,60,0.15)' }}
            >
              <X className="w-3.5 h-3.5 inline" />
            </button>
          )}
          {!compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <ChevronRight className="w-4 h-4 transition-transform" style={{ color: '#39383b', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
            </button>
          )}
        </div>
      </div>
      {expanded && !compact && (
        <div className="mt-4 pt-4 grid sm:grid-cols-2 gap-3 text-sm" style={{ borderTop: '1px solid rgba(205,115,141,0.08)' }}>
          <div className="flex items-center gap-2 text-ink-600">
            <Phone className="w-4 h-4" style={{ color: '#cd738d' }} /> <span style={{ color: '#6a686c' }}>{apt.client_phone}</span>
          </div>
          {apt.client_email && (
            <div className="flex items-center gap-2 text-ink-600">
              <Mail className="w-4 h-4" style={{ color: '#cd738d' }} /> <span style={{ color: '#6a686c' }}>{apt.client_email}</span>
            </div>
          )}
          <div className="text-ink-600">
            Duration: {formatDuration(apt.service_duration)} · {formatTime(apt.start_time)} – {formatTime(apt.end_time)}
          </div>
          <div className="text-ink-600">Price: {formatNaira(Number(apt.service_price))}</div>
          {apt.notes && (
            <div className="sm:col-span-2 text-ink-600">
              <span className="text-ink-400">Notes:</span> {apt.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryManager() {
  const [items, setItems] = useState<{ id: string; title: string; category: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ title: '', category: 'lashes', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminFetchGallery();
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch gallery:', err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ file: base64String }),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        setNewItem({ ...newItem, image_url: data.url });
        setUploadProgress(100);
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.title.trim() || !newItem.image_url.trim()) return;
    try {
      const data = await adminAddGalleryItem({
        title: newItem.title.trim(),
        category: newItem.category,
        image_url: newItem.image_url.trim(),
      });
      setItems([data, ...items]);
      setNewItem({ title: '', category: 'lashes', image_url: '' });
    } catch (err) {
      console.error('Failed to add gallery item:', err);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await adminDeleteGalleryItem(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Failed to delete gallery item:', err);
    }
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#cd738d' }} />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#371c14' }}>Add Gallery Item</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="input-lux"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="input-lux"
            >
              <option value="lashes">Lashes</option>
              <option value="brows">Brows</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="label-lux">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="input-lux"
            />
            {uploading && (
              <div className="mt-2 text-sm" style={{ color: '#cd738d' }}>
                Uploading... {uploadProgress}%
              </div>
            )}
          </div>

          {newItem.image_url && (
            <div className="relative aspect-square max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(205,115,141,0.2)' }}>
              <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <button onClick={addItem} disabled={!newItem.title.trim() || !newItem.image_url.trim()} className="btn-gold text-sm disabled:opacity-50">
            Add to Gallery
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3" style={{ background: 'rgba(10,8,6,0.85)' }}>
              <p className="text-white text-sm font-medium mb-2 text-center">{item.title}</p>
              <button
                onClick={() => deleteItem(item.id)}
                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesManager({ services, setServices, toggleServiceActive, checkAuth }: {
  services: Service[];
  setServices: (services: Service[]) => void;
  toggleServiceActive: (id: string, isActive: boolean) => void;
  checkAuth: (err: unknown) => void;
}) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);

  const [newItem, setNewItem] = useState<Partial<Service>>({ name: '', description: '', price: 0, duration_minutes: 60, category: 'lashes', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ file: base64String }),
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        
        if (isEdit) {
          setEditForm({ ...editForm, image_url: data.url });
        } else {
          setNewItem({ ...newItem, image_url: data.url });
        }
        setUploadProgress(100);
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddService = async () => {
    if (!newItem.name?.trim() || !newItem.price || !newItem.duration_minutes) return;
    setSaving(true);
    try {
      const data = await adminCreateService(newItem);
      setServices([...services, data]);
      setNewItem({ name: '', description: '', price: 0, duration_minutes: 60, category: 'lashes', image_url: '' });
    } catch (err) {
      console.error('Failed to create service:', err);
      checkAuth(err);
      alert('Failed to add service.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
      category: service.category,
      image_url: service.image_url,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingService) return;
    setSaving(true);
    try {
      await adminUpdateService(editingService.id, editForm);
      setServices(services.map((s) => s.id === editingService.id ? { ...s, ...editForm } : s));
      setEditingService(null);
      setEditForm({});
    } catch (err) {
      console.error('Failed to update service:', err);
      checkAuth(err);
      alert('Failed to update service. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await adminDeleteService(id);
      setServices(services.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
      checkAuth(err);
      alert('Failed to delete service. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Service Section */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#371c14' }}>Add New Service</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Service Name</label>
              <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="input-lux" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Category</label>
              <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="input-lux">
                <option value="lashes">Lashes</option>
                <option value="brows">Brows</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Description</label>
            <textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="input-lux min-h-[60px]" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Price (₦)</label>
              <input type="number" value={newItem.price || ''} onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})} className="input-lux" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Duration (min)</label>
              <input type="number" value={newItem.duration_minutes || ''} onChange={(e) => setNewItem({...newItem, duration_minutes: Number(e.target.value)})} className="input-lux" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Upload Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} className="input-lux" />
            {uploading && <div className="mt-2 text-sm" style={{ color: '#cd738d' }}>Uploading... {uploadProgress}%</div>}
          </div>
          {newItem.image_url && (
            <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(205,115,141,0.2)' }}>
              <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <button onClick={handleAddService} disabled={saving || !newItem.name?.trim() || !newItem.price} className="btn-gold text-sm disabled:opacity-50 mt-4">
            {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : 'Add Service'}
          </button>
        </div>
      </div>

      {/* List Services Section */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#371c14' }}>Manage Services</h3>
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,115,141,0.1)' }}>
              <div className="flex-grow flex items-center gap-4">
                {svc.image_url && (
                  <img src={svc.image_url} alt={svc.name} className="w-16 h-16 object-cover rounded-lg" style={{ border: '1px solid rgba(205,115,141,0.2)' }} />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium" style={{ color: '#371c14' }}>{svc.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: svc.is_active ? 'rgba(60,180,60,0.15)' : 'rgba(255,255,255,0.05)', color: svc.is_active ? '#6be06b' : '#39383b' }}>
                      {svc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#39383b' }}>{svc.description}</p>
                  <p className="text-sm mt-1" style={{ color: '#39383b' }}>{formatDuration(svc.duration_minutes)} • {formatNaira(svc.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(svc)} className="p-2 rounded-lg transition-colors hover:bg-opacity-80" style={{ background: 'rgba(205,115,141,0.15)', color: '#cd738d' }} title="Edit service"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(svc.id, svc.name)} className="p-2 rounded-lg transition-colors hover:bg-opacity-80" style={{ background: 'rgba(200,60,60,0.1)', color: 'rgba(200,80,80,0.8)' }} title="Delete service"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => toggleServiceActive(svc.id, svc.is_active)} className="relative w-11 h-6 rounded-full transition-colors" style={{ background: svc.is_active ? '#cd738d' : 'rgba(255,255,255,0.1)' }} title={svc.is_active ? 'Deactivate' : 'Activate'}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full transition-transform" style={{ background: '#371c14', transform: svc.is_active ? 'translateX(20px)' : 'translateX(2px)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,8,6,0.85)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.98)', border: '1px solid rgba(205,115,141,0.2)' }}>
            <h3 className="font-serif text-2xl mb-6" style={{ color: '#371c14' }}>Edit Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Service Name</label>
                <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-lux" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Description</label>
                <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-lux min-h-[100px]" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Price (₦)</label>
                  <input type="number" value={editForm.price || ''} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Duration (min)</label>
                  <input type="number" value={editForm.duration_minutes || ''} onChange={(e) => setEditForm({ ...editForm, duration_minutes: Number(e.target.value) })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Category</label>
                  <select value={editForm.category || 'lashes'} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="input-lux">
                    <option value="lashes">Lashes</option>
                    <option value="brows">Brows</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Upload Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} className="input-lux" />
                {uploading && <div className="mt-2 text-sm" style={{ color: '#cd738d' }}>Uploading... {uploadProgress}%</div>}
              </div>
              {editForm.image_url && (
                <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(205,115,141,0.2)' }}>
                  <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEdit} disabled={saving || !editForm.name?.trim()} className="flex-1 btn-gold disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Save Changes'}
              </button>
              <button onClick={() => { setEditingService(null); setEditForm({}); }} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.04)', color: '#6a686c', border: '1px solid rgba(205,115,141,0.1)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsManager() {
  const [reviews, setReviews] = useState<{ id: string; client_name: string; rating: number; comment: string; is_published: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminFetchReviews();
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      await adminUpdateReview(id, { is_published: !isPublished });
      setReviews(reviews.map((r) => r.id === id ? { ...r, is_published: !isPublished } : r));
    } catch (err) {
      console.error('Failed to toggle review publish status:', err);
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await adminDeleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#cd738d' }} />;

  return (
    <div className="space-y-3">
      {reviews.length === 0 ? (
        <p className="text-center py-8" style={{ color: '#39383b' }}>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="rounded-2xl p-5" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium" style={{ color: '#371c14' }}>{review.client_name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5" style={{ fill: '#cd738d', color: '#cd738d' }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#6a686c' }}>{review.comment}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ background: review.is_published ? 'rgba(60,180,60,0.15)' : 'rgba(255,255,255,0.05)', color: review.is_published ? '#6be06b' : '#39383b' }}>
                {review.is_published ? 'Published' : 'Hidden'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => togglePublish(review.id, review.is_published)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#6a686c', border: '1px solid rgba(205,115,141,0.1)' }}
              >
                {review.is_published ? 'Hide' : 'Publish'}
              </button>
              <button
                onClick={() => deleteReview(review.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(200,60,60,0.1)', color: 'rgba(200,80,80,0.8)', border: '1px solid rgba(200,60,60,0.15)' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
