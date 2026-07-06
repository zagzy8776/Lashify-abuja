import { useEffect, useState } from 'react';
import {
  Lock, Loader2, Calendar, Users, DollarSign, TrendingUp,
  Clock, Check, X, Phone, Mail, ChevronRight, LogOut,
  Scissors, Star, Image as ImageIcon, Pencil, Trash2, MessageSquare
} from 'lucide-react';
import {
  adminLogin, adminLogout, isAdminAuthenticated,
  adminFetchAllAppointments, adminFetchAllServices,
  adminUpdateService, adminCreateService, adminDeleteService, updateAppointmentStatus,
  adminDeleteAppointment, adminUpdateAppointmentDetails,
  adminFetchGallery, adminAddGalleryItem, adminDeleteGalleryItem,
  adminFetchReviews, adminUpdateReview, adminDeleteReview,
  type Service, type Appointment, type AppointmentStatus
} from '../lib/supabase';
import {
  formatNaira, formatDuration, formatTime, DAYS_SHORT, addMinutesToTime
} from '../lib/utils';

type Props = {
  onNavigate: (page: string) => void;
};

type Tab = 'overview' | 'appointments' | 'inbox' | 'services' | 'gallery' | 'reviews';

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
      <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-6 overflow-hidden">
              <Lock className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="font-extrabold text-3xl tracking-tight text-gray-900">Admin Portal</h1>
            <p className="text-sm font-medium mt-2 text-gray-500">Sign in to manage LashifyAbuja</p>
          </div>

          <form onSubmit={handleLogin} className="rounded-[24px] bg-white p-8 border border-gray-200 shadow-xl">
            <div className="mb-5">
              <label className="block text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all font-medium text-gray-900"
                placeholder="admin@lashifyabuja.com"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all font-medium text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm mb-4 text-center font-bold text-red-600 bg-red-50 py-2 rounded-lg">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-14 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center shadow-sm"
            >
              {loggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="w-full text-center text-sm font-bold mt-8 text-gray-400 hover:text-gray-900 transition-colors"
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

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editApptForm, setEditApptForm] = useState<Partial<Appointment>>({});
  const [savingAppt, setSavingAppt] = useState(false);

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

  const handleDeleteAppointment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely delete ${name}'s appointment? This cannot be undone.`)) return;
    try {
      await adminDeleteAppointment(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      checkAuth(err);
      alert('Failed to delete appointment.');
    }
  };

  const handleEditAppointment = (apt: Appointment) => {
    setEditingAppointment(apt);
    setEditApptForm({
      client_name: apt.client_name,
      client_phone: apt.client_phone,
      client_email: apt.client_email,
      appointment_date: apt.appointment_date,
      start_time: apt.start_time,
      notes: apt.notes,
    });
  };

  const handleSaveEditAppointment = async () => {
    if (!editingAppointment) return;
    setSavingAppt(true);
    try {
      const endTime = addMinutesToTime(
        editApptForm.start_time || editingAppointment.start_time,
        editingAppointment.service_duration
      );
      const updated = await adminUpdateAppointmentDetails(editingAppointment.id, { 
        ...editApptForm, 
        end_time: endTime 
      });
      setAppointments(appointments.map(a => a.id === updated.id ? updated : a));
      setEditingAppointment(null);
      setEditApptForm({});
    } catch (err) {
      console.error('Failed to edit appointment:', err);
      checkAuth(err);
      alert('Failed to update appointment details.');
    } finally {
      setSavingAppt(false);
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
    { key: 'inbox', label: 'Inbox', icon: MessageSquare },
    { key: 'services', label: 'Services', icon: Scissors },
    { key: 'gallery', label: 'Gallery', icon: ImageIcon },
    { key: 'reviews', label: 'Reviews', icon: Star },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr && a.status !== 'cancelled' && a.status !== 'completed');
  const upcomingAppointments = appointments
    .filter((a) => a.appointment_date > todayStr && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.start_time.localeCompare(b.start_time));
  const pastAppointments = appointments
    .filter((a) => a.appointment_date < todayStr || a.status === 'cancelled' || a.status === 'completed')
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date) || b.start_time.localeCompare(a.start_time));

  const totalRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + Number(a.service_price), 0);
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen section-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#b38b9e' }} />
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="container-lux py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-extrabold text-3xl tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-sm mt-1 font-medium text-gray-500">Welcome back, Lashify</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all relative ${
                tab === t.key
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {(t.key === 'appointments' || t.key === 'inbox') && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Calendar} label="Today's Appointments" value={todayAppointments.length.toString()} color="gold" />
              <StatCard icon={Clock} label="Pending Requests" value={pendingCount.toString()} color="rose" />
              <StatCard icon={Users} label="Total Bookings" value={appointments.length.toString()} color="ink" />
              <StatCard icon={DollarSign} label="Revenue (Completed)" value={formatNaira(totalRevenue)} color="green" />
            </div>

            <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-extrabold tracking-tight text-xl mb-5 text-gray-900">Upcoming Appointments</h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm py-8 text-center text-gray-500 font-medium">No upcoming appointments.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 5).map((apt) => (
                    <AppointmentRow
                      key={apt.id}
                      apt={apt}
                      onStatusChange={handleUpdateAppointmentStatus}
                      onEdit={handleEditAppointment}
                      onDelete={handleDeleteAppointment}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div className="space-y-8">
            <div className="rounded-2xl p-8 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <h3 className="font-extrabold tracking-tight text-2xl text-gray-900">Today's Bookings</h3>
              </div>
              {todayAppointments.length === 0 ? (
                <p className="text-sm py-4 italic text-gray-500 font-medium">No appointments scheduled for today.</p>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <AppointmentRow key={apt.id} apt={apt} onStatusChange={handleUpdateAppointmentStatus} onEdit={handleEditAppointment} onDelete={handleDeleteAppointment} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-8 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-extrabold tracking-tight text-2xl mb-6 text-gray-900">Upcoming</h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm py-4 italic text-gray-500 font-medium">No future appointments found.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <AppointmentRow key={apt.id} apt={apt} onStatusChange={handleUpdateAppointmentStatus} onEdit={handleEditAppointment} onDelete={handleDeleteAppointment} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-8 bg-gray-50 border border-gray-200">
              <h3 className="font-extrabold tracking-tight text-xl mb-6 text-gray-600">Past History</h3>
              {pastAppointments.length === 0 ? (
                <p className="text-sm py-4 italic text-gray-500 font-medium">No history yet.</p>
              ) : (
                <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                  {pastAppointments.slice(0, 10).map((apt) => (
                    <AppointmentRow key={apt.id} apt={apt} onStatusChange={handleUpdateAppointmentStatus} onEdit={handleEditAppointment} onDelete={handleDeleteAppointment} compact />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'inbox' && (
          <div className="rounded-2xl p-8 bg-white border border-gray-200 shadow-sm">
            <h3 className="font-extrabold tracking-tight text-xl mb-6 text-gray-900">Client Messages</h3>
            {appointments.filter(a => a.notes).length === 0 ? (
              <p className="text-sm py-8 text-center text-gray-500 font-medium">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {appointments.filter(a => a.notes).map((apt) => (
                  <div key={apt.id} className={`p-5 rounded-2xl border relative ${apt.status === 'pending' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                    {apt.status === 'pending' && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></span>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm border border-gray-200">
                        <span className="font-extrabold text-xl text-gray-900">{apt.client_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 leading-tight">{apt.client_name}</h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{apt.client_email || apt.client_phone} · For <span className="text-gray-900">{apt.service_name}</span></p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl text-sm font-medium text-gray-700 leading-relaxed mb-4 bg-white border border-gray-200 shadow-sm">
                      "{apt.notes}"
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-auto">Booking Date: {new Date(apt.appointment_date).toLocaleDateString()}</span>
                      {apt.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateAppointmentStatus(apt.id, 'confirmed')} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                            Accept Booking
                          </button>
                          <button onClick={() => handleUpdateAppointmentStatus(apt.id, 'cancelled')} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                            Decline
                          </button>
                        </>
                      )}
                      {apt.status !== 'pending' && (
                        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-white text-gray-500 border border-gray-200">
                          {apt.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
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

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(250, 247, 242, 0.85)' }}>
          <div className="w-full max-w-xl rounded-2xl p-6 shadow-xl" style={{ background: 'rgba(223,191,174,0.98)', border: '1px solid rgba(179, 139, 158, 0.2)' }}>
            <h3 className="font-serif text-2xl mb-6" style={{ color: '#3d2e36' }}>Edit Booking Details</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Client Name</label>
                  <input type="text" value={editApptForm.client_name || ''} onChange={(e) => setEditApptForm({ ...editApptForm, client_name: e.target.value })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Phone Number</label>
                  <input type="text" value={editApptForm.client_phone || ''} onChange={(e) => setEditApptForm({ ...editApptForm, client_phone: e.target.value })} className="input-lux" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Email Address (Optional)</label>
                <input type="email" value={editApptForm.client_email || ''} onChange={(e) => setEditApptForm({ ...editApptForm, client_email: e.target.value })} className="input-lux" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Date</label>
                  <input type="date" value={editApptForm.appointment_date || ''} onChange={(e) => setEditApptForm({ ...editApptForm, appointment_date: e.target.value })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Time</label>
                  <input type="time" value={editApptForm.start_time || ''} onChange={(e) => setEditApptForm({ ...editApptForm, start_time: e.target.value })} className="input-lux" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Notes / Payment Ref</label>
                <textarea value={editApptForm.notes || ''} onChange={(e) => setEditApptForm({ ...editApptForm, notes: e.target.value })} className="input-lux min-h-[80px]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEditAppointment} disabled={savingAppt} className="flex-1 btn-gold disabled:opacity-50">
                {savingAppt ? <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> : 'Save Changes'}
              </button>
              <button onClick={() => { setEditingAppointment(null); setEditApptForm({}); }} disabled={savingAppt} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.5)', color: '#b38b9e', border: '1px solid rgba(179, 139, 158, 0.08)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Calendar;
  label: string;
  value: string;
  color: 'gold' | 'rose' | 'ink' | 'green';
}) {
  const iconColors: Record<string, string> = { gold: '#3b82f6', rose: '#ef4444', ink: '#6b7280', green: '#10b981' };
  const bgColors: Record<string, string> = { gold: 'bg-blue-50', rose: 'bg-red-50', ink: 'bg-gray-50', green: 'bg-green-50' };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm transition-all hover:shadow-md">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bgColors[color]}`}>
        <Icon className="w-6 h-6" style={{ color: iconColors[color] }} />
      </div>
      <div className="font-extrabold text-3xl text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function AppointmentRow({ apt, onStatusChange, onEdit, onDelete, compact }: {
  apt: Appointment;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onEdit?: (apt: Appointment) => void;
  onDelete?: (id: string, name: string) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, { bg: string; text: string }> = {
    pending:   { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    no_show:   { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  const date = new Date(apt.appointment_date + 'T00:00:00');

  return (
    <div className="p-4 sm:p-5 rounded-2xl transition-all duration-300 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-6 flex-grow">
          <div className="text-center shrink-0 w-14 sm:w-16 bg-gray-50 rounded-xl py-2 border border-gray-100">
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{DAYS_SHORT[date.getDay()]}</div>
            <div className="font-extrabold text-2xl sm:text-3xl text-gray-900 my-0.5">{date.getDate()}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
              <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">{apt.service_name}</h4>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md w-fit shrink-0 ${statusColors[apt.status].bg} ${statusColors[apt.status].text}`}>
                {apt.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
              <span className="text-gray-900">{apt.client_name}</span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="text-gray-500">{formatTime(apt.start_time)}</span>
              {!compact && (
                <>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="text-gray-900">{formatNaira(Number(apt.service_price))}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-4 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto justify-end border-gray-100 mt-2 sm:mt-0">
          {apt.status === 'pending' && (
            <button
              onClick={() => onStatusChange(apt.id, 'confirmed')}
              title="Accept Appointment"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" /> Accept
            </button>
          )}
          {(apt.status === 'pending' || apt.status === 'confirmed') && (
            <button
              onClick={() => onStatusChange(apt.id, 'completed')}
              title="Mark as Completed"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" /> Complete
            </button>
          )}
          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
            <button
              onClick={() => onStatusChange(apt.id, 'cancelled')}
              title="Decline / Cancel"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(apt)}
              title="Edit Details"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(apt.id, apt.client_name)}
              title="Delete Forever"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {!compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-gray-50 text-gray-500 hover:bg-gray-100"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>
      {expanded && !compact && (
        <div className="mt-4 pt-4 grid sm:grid-cols-2 gap-4 text-sm border-t border-gray-100 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-gray-400" /> <span className="font-medium">{apt.client_phone}</span>
          </div>
          {apt.client_email && (
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" /> <span className="font-medium">{apt.client_email}</span>
            </div>
          )}
          <div className="text-gray-700">
            <span className="text-gray-400 mr-2">Duration:</span>
            <span className="font-medium">{formatDuration(apt.service_duration)} · {formatTime(apt.start_time)} – {formatTime(apt.end_time)}</span>
          </div>
          <div className="text-gray-700">
            <span className="text-gray-400 mr-2">Price:</span>
            <span className="font-bold text-gray-900">{formatNaira(Number(apt.service_price))}</span>
          </div>
          {apt.notes && (
            <div className="sm:col-span-2 text-gray-700">
              <span className="text-gray-400 mr-2">Notes:</span> 
              <span className="font-medium">{apt.notes}</span>
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

  if (loading) return <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#b38b9e' }} />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background: 'rgba(223,191,174,0.7)', border: '1px solid rgba(74,35,17,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#3d2e36' }}>Add Gallery Item</h3>
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
              <div className="mt-2 text-sm" style={{ color: '#b38b9e' }}>
                Uploading... {uploadProgress}%
              </div>
            )}
          </div>

          {newItem.image_url && (
            <div className="relative aspect-square max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(179, 139, 158, 0.2)' }}>
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
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3" style={{ background: 'rgba(250, 247, 242, 0.85)' }}>
              <p className="text-[#3d2e36] text-sm font-medium mb-2 text-center">{item.title}</p>
              <button
                onClick={() => deleteItem(item.id)}
                className="px-3 py-1.5 bg-rose-500 text-[#3d2e36] rounded-lg text-xs font-medium hover:bg-rose-600"
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
      <div className="rounded-2xl p-6" style={{ background: 'rgba(223,191,174,0.7)', border: '1px solid rgba(74,35,17,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#3d2e36' }}>Add New Service</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Service Name</label>
              <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="input-lux" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Category</label>
              <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="input-lux">
                <option value="lashes">Lashes</option>
                <option value="brows">Brows</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Description</label>
            <textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="input-lux min-h-[60px]" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Price (₦)</label>
              <input type="number" value={newItem.price || ''} onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})} className="input-lux" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Duration (min)</label>
              <input type="number" value={newItem.duration_minutes || ''} onChange={(e) => setNewItem({...newItem, duration_minutes: Number(e.target.value)})} className="input-lux" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#b38b9e' }}>Upload Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} className="input-lux" />
            {uploading && <div className="mt-2 text-sm" style={{ color: '#b38b9e' }}>Uploading... {uploadProgress}%</div>}
          </div>
          {newItem.image_url && (
            <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(179, 139, 158, 0.2)' }}>
              <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <button onClick={handleAddService} disabled={saving || !newItem.name?.trim() || !newItem.price} className="btn-gold text-sm disabled:opacity-50 mt-4">
            {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : 'Add Service'}
          </button>
        </div>
      </div>

      {/* List Services Section */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(223,191,174,0.7)', border: '1px solid rgba(74,35,17,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#3d2e36' }}>Manage Services</h3>
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(179, 139, 158, 0.08)' }}>
              <div className="flex-grow flex items-center gap-4">
                {svc.image_url && (
                  <img src={svc.image_url} alt={svc.name} className="w-16 h-16 object-cover rounded-lg" style={{ border: '1px solid rgba(179, 139, 158, 0.2)' }} />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium" style={{ color: '#3d2e36' }}>{svc.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: svc.is_active ? 'rgba(60,180,60,0.15)' : 'rgba(255,255,255,0.6)', color: svc.is_active ? '#6be06b' : '#5a4850' }}>
                      {svc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#5a4850' }}>{svc.description}</p>
                  <p className="text-sm mt-1" style={{ color: '#5a4850' }}>{formatDuration(svc.duration_minutes)} • {formatNaira(svc.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(svc)} className="p-2 rounded-lg transition-colors hover:bg-opacity-80" style={{ background: 'rgba(179, 139, 158, 0.3)', color: '#b38b9e' }} title="Edit service"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(svc.id, svc.name)} className="p-2 rounded-lg transition-colors hover:bg-opacity-80" style={{ background: 'rgba(200,60,60,0.1)', color: 'rgba(200,80,80,0.8)' }} title="Delete service"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => toggleServiceActive(svc.id, svc.is_active)} className="relative w-11 h-6 rounded-full transition-colors" style={{ background: svc.is_active ? '#b38b9e' : 'rgba(255,255,255,0.7)' }} title={svc.is_active ? 'Deactivate' : 'Activate'}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full transition-transform" style={{ background: '#3d2e36', transform: svc.is_active ? 'translateX(20px)' : 'translateX(2px)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(250, 247, 242, 0.85)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6" style={{ background: 'rgba(223,191,174,0.98)', border: '1px solid rgba(179, 139, 158, 0.2)' }}>
            <h3 className="font-serif text-2xl mb-6" style={{ color: '#3d2e36' }}>Edit Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#b38b9e' }}>Service Name</label>
                <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-lux" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#b38b9e' }}>Description</label>
                <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-lux min-h-[100px]" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b38b9e' }}>Price (₦)</label>
                  <input type="number" value={editForm.price || ''} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b38b9e' }}>Duration (min)</label>
                  <input type="number" value={editForm.duration_minutes || ''} onChange={(e) => setEditForm({ ...editForm, duration_minutes: Number(e.target.value) })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b38b9e' }}>Category</label>
                  <select value={editForm.category || 'lashes'} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="input-lux">
                    <option value="lashes">Lashes</option>
                    <option value="brows">Brows</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#b38b9e' }}>Upload Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} className="input-lux" />
                {uploading && <div className="mt-2 text-sm" style={{ color: '#b38b9e' }}>Uploading... {uploadProgress}%</div>}
              </div>
              {editForm.image_url && (
                <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(179, 139, 158, 0.2)' }}>
                  <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEdit} disabled={saving || !editForm.name?.trim()} className="flex-1 btn-gold disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Save Changes'}
              </button>
              <button onClick={() => { setEditingService(null); setEditForm({}); }} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.5)', color: '#b38b9e', border: '1px solid rgba(179, 139, 158, 0.08)' }}>Cancel</button>
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

  if (loading) return <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#b38b9e' }} />;

  return (
    <div className="space-y-3">
      {reviews.length === 0 ? (
        <p className="text-center py-8" style={{ color: '#5a4850' }}>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="rounded-2xl p-5" style={{ background: 'rgba(223,191,174,0.7)', border: '1px solid rgba(74,35,17,0.12)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium" style={{ color: '#3d2e36' }}>{review.client_name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5" style={{ fill: '#b38b9e', color: '#b38b9e' }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#b38b9e' }}>{review.comment}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ background: review.is_published ? 'rgba(60,180,60,0.15)' : 'rgba(255,255,255,0.6)', color: review.is_published ? '#6be06b' : '#5a4850' }}>
                {review.is_published ? 'Published' : 'Hidden'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => togglePublish(review.id, review.is_published)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.5)', color: '#b38b9e', border: '1px solid rgba(179, 139, 158, 0.08)' }}
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
