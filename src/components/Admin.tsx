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
                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900"
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
                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900"
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
              className="w-full h-14 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center shadow-sm"
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
  const [aptToDelete, setAptToDelete] = useState<{ id: string, name: string } | null>(null);

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
    setAptToDelete({ id, name });
  };

  const confirmDeleteAppointment = async () => {
    if (!aptToDelete) return;
    try {
      await adminDeleteAppointment(aptToDelete.id);
      setAppointments(appointments.filter(a => a.id !== aptToDelete.id));
      setAptToDelete(null);
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
                  ? 'bg-rose-500 text-white shadow-md'
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

      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-500/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight mb-6">Edit Booking Details</h3>
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Client Name</label>
                  <input type="text" value={editApptForm.client_name || ''} onChange={(e) => setEditApptForm({ ...editApptForm, client_name: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Phone Number</label>
                  <input type="text" value={editApptForm.client_phone || ''} onChange={(e) => setEditApptForm({ ...editApptForm, client_phone: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Email Address (Optional)</label>
                <input type="email" value={editApptForm.client_email || ''} onChange={(e) => setEditApptForm({ ...editApptForm, client_email: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Date</label>
                  <input type="date" value={editApptForm.appointment_date || ''} onChange={(e) => setEditApptForm({ ...editApptForm, appointment_date: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Time</label>
                  <input type="time" value={editApptForm.start_time || ''} onChange={(e) => setEditApptForm({ ...editApptForm, start_time: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Notes / Payment Ref</label>
                <textarea value={editApptForm.notes || ''} onChange={(e) => setEditApptForm({ ...editApptForm, notes: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900 min-h-[80px]" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleSaveEditAppointment} disabled={savingAppt} className="flex-1 h-12 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center">
                {savingAppt ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Save Changes'}
              </button>
              <button onClick={() => setEditingAppointment(null)} disabled={savingAppt} className="px-6 h-12 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!aptToDelete}
        title="Delete Appointment"
        message={`Are you sure you want to completely delete ${aptToDelete?.name}'s appointment? This cannot be undone.`}
        onConfirm={confirmDeleteAppointment}
        onCancel={() => setAptToDelete(null)}
      />
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

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void, confirmText?: string, isDanger?: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-500/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="font-extrabold text-xl text-gray-900 tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-12 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 h-12 text-white font-bold rounded-xl transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-rose-500 hover:bg-rose-600'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function GalleryManager() {
  const [items, setItems] = useState<{ id: string; title: string; category: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ title: '', category: 'lash', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; title: string; category: string; image_url: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, title: string } | null>(null);

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
        setNewItem({ ...newItem, image_url: data.url });
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

  const addItem = async () => {
    if (!newItem.title.trim() || !newItem.image_url.trim()) return;
    try {
      const data = await adminAddGalleryItem({
        title: newItem.title.trim(),
        category: newItem.category,
        image_url: newItem.image_url.trim(),
      });
      setItems([data, ...items]);
      setNewItem({ title: '', category: 'lash', image_url: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add gallery item:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.title.trim()) return;
    try {
      await adminUpdateGalleryItem(editingItem.id, {
        title: editingItem.title.trim(),
        category: editingItem.category,
        image_url: editingItem.image_url.trim(),
      });
      setItems(items.map((i) => i.id === editingItem.id ? editingItem : i));
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update gallery item:', err);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await adminDeleteGalleryItem(itemToDelete.id);
      setItems(items.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete gallery item:', err);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="font-extrabold tracking-tight text-xl text-gray-900">Portfolio Gallery</h3>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage the images shown on your website's gallery.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Add Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-rose-500/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
              <p className="text-white text-sm font-bold mb-3 text-center tracking-wide">{item.title}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingItem(item)}
                  className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setItemToDelete(item)}
                  className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm">
              {item.category}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">No images in your gallery yet.</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-500/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight">Add Gallery Image</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <Trash2 className="w-5 h-5 opacity-0" /> {/* Spacer */}
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Classic Wispy Set"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Category</label>
                <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="w-full h-12 bg-white border border-gray-200 rounded-lg px-4 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500">
                  <option value="lash">LASH</option>
                  <option value="brows">BROWS</option>
                  <option value="lash-refill">LASH REFILL</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Upload Picture</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-gray-400 transition-colors bg-gray-50 text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mb-2" />
                      <span className="text-sm font-bold text-gray-500">Uploading... {uploadProgress}%</span>
                    </div>
                  ) : newItem.image_url ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm">
                      <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                        <span className="text-gray-400">+</span>
                      </div>
                      <span className="text-sm font-bold text-gray-500">Click or drag image here</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={addItem} 
                  disabled={!newItem.title.trim() || !newItem.image_url.trim() || uploading} 
                  className="flex-1 h-12 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Save Image
                </button>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="px-6 h-12 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-500/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight mb-6">Edit Gallery Image</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Title / Description</label>
                <input type="text" placeholder="e.g. Classic Wispy Set" value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Category</label>
                <select value={editingItem.category} onChange={(e) => setEditingItem({...editingItem, category: e.target.value})} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900">
                  <option value="lash">LASH</option>
                  <option value="brows">BROWS</option>
                  <option value="lash-refill">LASH REFILL</option>
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={handleSaveEdit} disabled={!editingItem.title.trim()} className="flex-1 h-12 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 shadow-sm">
                  Save Changes
                </button>
                <button onClick={() => setEditingItem(null)} className="px-6 h-12 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Image"
        message={`Are you sure you want to delete "${itemToDelete?.title}" from the gallery?`}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Service>>({ name: '', description: '', price: 0, duration_minutes: 0, duration_text: '', category: 'lash', image_url: '' });
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string, name: string } | null>(null);

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
      setNewItem({ name: '', description: '', price: 0, duration_minutes: 0, duration_text: '', category: 'lash', image_url: '' });
      setShowAddModal(false);
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
      duration_text: service.duration_text,
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

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await adminDeleteService(serviceToDelete.id);
      setServices(services.filter((s) => s.id !== serviceToDelete.id));
      setServiceToDelete(null);
    } catch (err) {
      console.error('Failed to delete service:', err);
      checkAuth(err);
      alert('Failed to delete service. Please try again.');
    }
  };

  const ServiceForm = ({ form, setForm, isEdit, onSave, onCancel }: any) => (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Service Name</label>
        <input type="text" placeholder="e.g. Volume Lashes" value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Category</label>
        <select value={form.category || 'lash'} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900">
          <option value="lash">LASH</option>
          <option value="brows">BROWS</option>
          <option value="lash-refill">LASH REFILL</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Description</label>
        <textarea placeholder="Describe the service..." value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900 min-h-[100px]" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Price (₦)</label>
          <input type="number" placeholder="0" value={form.price || ''} onChange={(e) => setForm({...form, price: Number(e.target.value)})} className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Time (mins)</label>
          <input type="number" placeholder="60" value={form.duration_minutes || ''} onChange={(e) => setForm({...form, duration_minutes: Number(e.target.value)})} className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Custom Time Label</label>
          <input type="text" placeholder="e.g. 2hrs" value={form.duration_text || ''} onChange={(e) => setForm({...form, duration_text: e.target.value})} className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium text-gray-900" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Service Image</label>
        <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-gray-400 transition-colors bg-gray-50 text-center cursor-pointer">
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, isEdit)} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mb-2" />
              <span className="text-sm font-bold text-gray-500">Uploading... {uploadProgress}%</span>
            </div>
          ) : form.image_url ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm"><span className="text-gray-400">+</span></div>
              <span className="text-sm font-bold text-gray-500">Click or drag image here</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <button onClick={onSave} disabled={saving || !form.name?.trim() || !form.price} className="flex-1 h-14 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm">
          {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Save Service'}
        </button>
        <button onClick={onCancel} disabled={saving} className="px-6 h-14 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="font-extrabold tracking-tight text-xl text-gray-900">Manage Services</h3>
          <p className="text-sm text-gray-500 font-medium mt-1">Add, edit, or deactivate your offerings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Add Service
        </button>
      </div>

      <div className="space-y-3">
        {services.map((svc) => (
          <div key={svc.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex-grow flex items-center gap-5">
              {svc.image_url ? (
                <img src={svc.image_url} alt={svc.name} className="w-16 h-16 object-cover rounded-2xl shadow-sm border border-gray-100 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-gray-300 text-xs font-bold uppercase">No Img</span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{svc.name}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${svc.is_active ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {svc.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                    {svc.category.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{svc.description?.substring(0, 80)}{svc.description?.length > 80 ? '...' : ''}</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatNaira(svc.price)} 
                  {(svc.duration_text || svc.duration_minutes > 0) && (
                    <span className="text-gray-400 font-medium">
                      · {svc.duration_text || formatDuration(svc.duration_minutes)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <button onClick={() => toggleServiceActive(svc.id, svc.is_active)} className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${svc.is_active ? 'bg-rose-500' : 'bg-gray-200'}`} title={svc.is_active ? 'Deactivate' : 'Activate'}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${svc.is_active ? 'left-[26px]' : 'left-1'}`} />
              </button>
              <div className="w-px h-6 bg-gray-100 mx-1"></div>
              <button onClick={() => handleEdit(svc)} className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors" title="Edit service">
                <Pencil className="w-5 h-5" />
              </button>
              <button onClick={() => setServiceToDelete({ id: svc.id, name: svc.name })} className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors" title="Delete service">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="py-12 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-gray-200">No services found. Add your first service!</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-500/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-[24px] p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight mb-6">Add New Service</h3>
            <ServiceForm form={newItem} setForm={setNewItem} isEdit={false} onSave={handleAddService} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-500/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-[24px] p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight mb-6">Edit Service</h3>
            <ServiceForm form={editForm} setForm={setEditForm} isEdit={true} onSave={handleSaveEdit} onCancel={() => { setEditingService(null); setEditForm({}); }} />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!serviceToDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteService}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
}

function ReviewsManager() {
  const [reviews, setReviews] = useState<{ id: string; client_name: string; rating: number; comment: string; is_published: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; name: string } | null>(null);

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

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await adminDeleteReview(reviewToDelete.id);
      setReviews(reviews.filter((r) => r.id !== reviewToDelete.id));
      setReviewToDelete(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-extrabold tracking-tight text-xl text-gray-900">Manage Reviews</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Publish or hide client feedback from your public page.</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-gray-200">No reviews yet.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{review.client_name}</h4>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed max-w-3xl">"{review.comment}"</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shrink-0 ${review.is_published ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                  {review.is_published ? 'Published' : 'Hidden'}
                </span>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => togglePublish(review.id, review.is_published)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${review.is_published ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
                >
                  {review.is_published ? 'Hide Review' : 'Publish Review'}
                </button>
                <button
                  onClick={() => setReviewToDelete({ id: review.id, name: review.client_name })}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Delete Review"
        message={`Are you sure you want to delete the review from ${reviewToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteReview}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
}
