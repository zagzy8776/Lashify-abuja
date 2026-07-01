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
  if (!res.ok) throw new Error('Failed to create appointment');
  return res.json();
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
