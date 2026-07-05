const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type Appointment = {
  id: string;
  client_id: string | null;
  service_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  service_name: string;
  service_price: number;
  service_duration: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TimeSlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type Review = {
  id: string;
  client_name: string;
  rating: number;
  comment: string;
  service_id: string | null;
  is_published: boolean;
  created_at: string;
};

// API Functions
export async function fetchServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/api/services`);
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

export async function fetchTimeSlots(): Promise<TimeSlot[]> {
  const res = await fetch(`${API_URL}/api/time-slots`);
  if (!res.ok) throw new Error('Failed to fetch time slots');
  return res.json();
}

export async function fetchAppointments(date?: string): Promise<Appointment[]> {
  const url = date ? `${API_URL}/api/appointments?date=${date}` : `${API_URL}/api/appointments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch(`${API_URL}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create appointment');
  return json;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const res = await fetch(`${API_URL}/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await fetch(`${API_URL}/api/gallery`);
  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
}

export async function fetchReviews(): Promise<Review[]> {
  const res = await fetch(`${API_URL}/api/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function createReview(data: Partial<Review>): Promise<Review> {
  const res = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}

// Admin Auth
export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error || 'Login failed' };
  localStorage.setItem('admin_token', data.token);
  return { success: true };
}

export async function adminLogout(): Promise<void> {
  localStorage.removeItem('admin_token');
}

export function isAdminAuthenticated(): boolean {
  return !!localStorage.getItem('admin_token');
}

// Admin API functions
export async function adminFetchAllAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function adminDeleteAppointment(id: string): Promise<void> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/appointments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete appointment');
}

export async function adminUpdateAppointmentDetails(id: string, data: Partial<Appointment>): Promise<Appointment> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/appointments/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
  return res.json();
}

export async function adminFetchAllServices(): Promise<Service[]> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

export async function adminUpdateService(id: string, data: Partial<Service>): Promise<void> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/services/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update service');
}

export async function adminCreateService(data: Partial<Service>): Promise<Service> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/services`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create service');
  return res.json();
}

export async function adminDeleteService(id: string): Promise<void> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/services/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete service');
}

export async function adminFetchGallery(): Promise<GalleryItem[]> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/gallery`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
}

export async function adminAddGalleryItem(data: Partial<GalleryItem>): Promise<GalleryItem> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/gallery`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add gallery item');
  return res.json();
}

export async function adminDeleteGalleryItem(id: string): Promise<void> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/gallery/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete gallery item');
}

export async function adminFetchReviews(): Promise<Review[]> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/reviews`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function adminUpdateReview(id: string, data: Partial<Review>): Promise<void> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update review');
}

export async function adminDeleteReview(id: string): Promise<void> {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete review');
}

export const services: Service[] = [
  { id: 'p1', name: 'Classic Lashes', slug: 'classic-lashes', category: 'lashes', price: 20000, duration_minutes: 90, description: 'A single extension applied to each natural lash for a subtle, natural enhancement.', is_active: true, created_at: '', sort_order: 1, image_url: null },
  { id: 'p2', name: 'Hybrid Lashes', slug: 'hybrid-lashes', category: 'lashes', price: 25000, duration_minutes: 120, description: 'A perfect blend of Classic and Volume lashes for a textured, fuller look.', is_active: true, created_at: '', sort_order: 2, image_url: null },
  { id: 'p3', name: 'Russian Lashes', slug: 'russian-lashes', category: 'lashes', price: 30000, duration_minutes: 150, description: 'Multiple lightweight extensions applied to each natural lash for dramatic fluff and volume.', is_active: true, created_at: '', sort_order: 3, image_url: null },
  { id: 'p4', name: 'Mega Volume', slug: 'mega-volume', category: 'lashes', price: 35000, duration_minutes: 180, description: 'The most dramatic, dense, and dark lash look available. Maximum fullness.', is_active: true, created_at: '', sort_order: 4, image_url: null },
  { id: 'p5', name: 'Wispy Lashes', slug: 'wispy-lashes', category: 'lashes', price: 28000, duration_minutes: 135, description: 'Spiky, textured, and customized styling for a trendy, wispy effect.', is_active: true, created_at: '', sort_order: 5, image_url: null },
  { id: 'p6', name: 'Microblading', slug: 'microblading', category: 'brows', price: 50000, duration_minutes: 120, description: 'Semi-permanent brow tattoo using hair-like strokes for a natural, fuller brow.', is_active: true, created_at: '', sort_order: 6, image_url: null },
  { id: 'p7', name: 'Ombre Powder Brows', slug: 'ombre-powder-brows', category: 'brows', price: 60000, duration_minutes: 150, description: 'A soft, shaded brow pencil look that is semi-permanent and heals beautifully.', is_active: true, created_at: '', sort_order: 7, image_url: null },
  { id: 'p8', name: 'Brow Lamination', slug: 'brow-lamination', category: 'brows', price: 25000, duration_minutes: 60, description: 'A perm for your brows that gives them a set, uniform shape for an extended period.', is_active: true, created_at: '', sort_order: 8, image_url: null },
  { id: 'p10', name: 'Brow Shaping', slug: 'brow-shaping', category: 'brows', price: 8000, duration_minutes: 30, description: 'Expert brow mapping and shaping using high-quality wax.', is_active: true, created_at: '', sort_order: 10, image_url: null }
];

export const defaultTimeSlots: TimeSlot[] = [
  { id: 't1', day_of_week: 1, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't2', day_of_week: 2, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't3', day_of_week: 3, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't4', day_of_week: 4, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't5', day_of_week: 5, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't6', day_of_week: 6, start_time: '10:00', end_time: '17:00', is_active: true, created_at: '' },
  { id: 't0', day_of_week: 0, start_time: '12:00', end_time: '17:00', is_active: false, created_at: '' }
];
