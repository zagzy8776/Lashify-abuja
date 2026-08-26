import { SERVICE_CATALOG } from './services-catalog';

const API_URL = ''; // Relative path because Next.js handles API directly

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number | null;
  duration_minutes: number;
  duration_text?: string;
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

export async function adminFetchAllAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_URL}/api/admin/appointments`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function adminDeleteAppointment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/appointments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete appointment');
}

export async function adminUpdateAppointmentDetails(id: string, data: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch(`${API_URL}/api/admin/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
  return res.json();
}

export async function adminFetchAllServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/api/admin/services`);
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

export async function adminUpdateService(id: string, data: Partial<Service>): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/services/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update service');
}

export async function adminCreateService(data: Partial<Service>): Promise<Service> {
  const res = await fetch(`${API_URL}/api/admin/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create service');
  return res.json();
}

export async function adminDeleteService(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/services/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete service');
}

export async function adminFetchGallery(): Promise<GalleryItem[]> {
  const res = await fetch(`${API_URL}/api/admin/gallery`);
  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
}

export async function adminAddGalleryItem(data: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch(`${API_URL}/api/admin/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add gallery item');
  return res.json();
}

export async function adminUpdateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch(`${API_URL}/api/admin/gallery/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update gallery item');
  return res.json();
}

export async function adminDeleteGalleryItem(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/gallery/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete gallery item');
}

export async function adminApplyBulkDiscount(discountPercentage: number = 15): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/services/apply-promo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'apply', discountPercentage }),
  });
  if (!res.ok) throw new Error('Failed to apply discount');
}

export async function adminRemoveBulkDiscount(): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/services/apply-promo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'remove' }),
  });
  if (!res.ok) throw new Error('Failed to remove discount');
}

export async function adminFetchReviews(): Promise<Review[]> {
  const res = await fetch(`${API_URL}/api/admin/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function adminUpdateReview(id: string, data: Partial<Review>): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update review');
}

export async function adminDeleteReview(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete review');
}

export const services: Service[] = SERVICE_CATALOG.map((s) => ({
  id: s.slug,
  name: s.name,
  slug: s.slug,
  category: s.category,
  price: s.price,
  duration_minutes: s.duration_minutes,
  duration_text: s.duration_text,
  description: s.description,
  is_active: true,
  created_at: '',
  sort_order: s.sort_order,
  image_url: null,
}));

export const defaultTimeSlots: TimeSlot[] = [
  { id: 't1', day_of_week: 1, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't2', day_of_week: 2, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't3', day_of_week: 3, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't4', day_of_week: 4, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't5', day_of_week: 5, start_time: '09:00', end_time: '19:00', is_active: true, created_at: '' },
  { id: 't6', day_of_week: 6, start_time: '10:00', end_time: '17:00', is_active: true, created_at: '' },
  { id: 't0', day_of_week: 0, start_time: '12:00', end_time: '17:00', is_active: false, created_at: '' }
];
