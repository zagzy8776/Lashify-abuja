const API_URL = ''; // Relative path because Next.js handles API directly

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
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

// Admin Auth handled by Next.js App Router and cookies.

// Admin API functions
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
    headers: { 
      'Content-Type': 'application/json',
    },
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
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update service');
}

export async function adminCreateService(data: Partial<Service>): Promise<Service> {
  const res = await fetch(`${API_URL}/api/admin/services`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
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
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add gallery item');
  return res.json();
}

export async function adminUpdateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch(`${API_URL}/api/admin/gallery/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ discountPercentage }),
  });
  if (!res.ok) throw new Error('Failed to apply discount');
}


export async function adminFetchReviews(): Promise<Review[]> {
  const res = await fetch(`${API_URL}/api/admin/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function adminUpdateReview(id: string, data: Partial<Review>): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
    },
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

export const services: Service[] = [
  // BROWS
  { id: 'b1', name: 'Ombré brows', slug: 'ombre-brows', category: 'brows', price: 50000, duration_minutes: 0, description: 'A soft, misty, powder-filled brow resembling the look of makeup. Perfect for a defined, flawless finish that lasts.', is_active: true, created_at: '', sort_order: 1, image_url: null },
  { id: 'b2', name: 'Combo brows', slug: 'combo-brows', category: 'brows', price: 60000, duration_minutes: 0, description: 'The ultimate brow transformation combining the natural hair strokes of microblading with the soft shading of Ombré for beautiful dimension.', is_active: true, created_at: '', sort_order: 2, image_url: null },
  { id: 'b3', name: 'Micro blading', slug: 'micro-blading', category: 'brows', price: 50000, duration_minutes: 0, description: 'Precise, semi-permanent hair-like strokes customized to enhance your natural brow shape for a fuller, ultra-realistic look.', is_active: true, created_at: '', sort_order: 3, image_url: null },
  { id: 'b4', name: 'Brow laminating and tint', slug: 'brow-laminating-and-tint', category: 'brows', price: 20000, duration_minutes: 0, description: 'A gentle lift for your brows that creates a full, sleek, brushed-up look, paired with a custom tint for striking definition.', is_active: true, created_at: '', sort_order: 4, image_url: null },
  { id: 'b5', name: 'Ombré brows touch up over 8 weeks', slug: 'ombre-brows-touch-up-over-8-weeks', category: 'brows', price: 25000, duration_minutes: 0, description: 'A necessary color and shape boost to keep your Ombré brows looking sharp, crisp, and beautifully pigmented.', is_active: true, created_at: '', sort_order: 5, image_url: null },
  { id: 'b6', name: 'Ombré brows touch up over 8 months', slug: 'ombre-brows-touch-up-over-8-months', category: 'brows', price: 45000, duration_minutes: 0, description: 'An extended maintenance session to restore vibrancy, depth, and perfect definition to your existing Ombré brows.', is_active: true, created_at: '', sort_order: 6, image_url: null },

  // LASH
  { id: 'l1', name: 'Classic sets', slug: 'classic-sets', category: 'lash', price: 20000, duration_minutes: 120, duration_text: '2hrs', description: 'A timeless 1:1 application where a single extension is applied to each natural lash. Ideal for a subtle, elegant, mascara-like finish.', is_active: true, created_at: '', sort_order: 7, image_url: null },
  { id: 'l2', name: 'Hybrid set', slug: 'hybrid-set', category: 'lash', price: 21500, duration_minutes: 120, duration_text: '2hrs', description: 'The perfect middle ground. A textured blend of classic and volume lashes for those who want a bit more fluff and everyday glamour.', is_active: true, created_at: '', sort_order: 8, image_url: null },
  { id: 'l3', name: 'Volume sets', slug: 'volume-sets', category: 'lash', price: 25000, duration_minutes: 210, duration_text: '3:30', description: 'Hand-made fans applied to each natural lash, delivering incredible fullness, depth, and a dramatic, fluffy finish.', is_active: true, created_at: '', sort_order: 9, image_url: null },
  { id: 'l4', name: 'Customize sets', slug: 'customize-sets', category: 'lash', price: 37000, duration_minutes: 210, duration_text: '3:30', description: 'A completely bespoke lash map tailored to your unique eye shape and style preference. The pinnacle of personalized luxury.', is_active: true, created_at: '', sort_order: 10, image_url: null },
  { id: 'l5', name: 'Mega volume', slug: 'mega-volume', category: 'lash', price: 30000, duration_minutes: 210, duration_text: '3:30', description: 'Unapologetically bold. Ultra-fine fans for maximum density, darkness, and an intensely glamorous, show-stopping look.', is_active: true, created_at: '', sort_order: 11, image_url: null },
  { id: 'l6', name: 'Bottom lashes', slug: 'bottom-lashes', category: 'lash', price: 7000, duration_minutes: 30, duration_text: '30m', description: 'A delicate enhancement applied to your lower lash line to balance your top set and subtly open up your eyes.', is_active: true, created_at: '', sort_order: 12, image_url: null },
  { id: 'l7', name: 'Wispy hybrid set', slug: 'wispy-hybrid-set', category: 'lash', price: 27500, duration_minutes: 120, duration_text: '2hr', description: 'A highly textured, fluttery look featuring varying lengths and "spikes" to create a modern, effortlessly chic style.', is_active: true, created_at: '', sort_order: 13, image_url: null },
  { id: 'l8', name: 'Anime set', slug: 'anime-set', category: 'lash', price: 23500, duration_minutes: 180, duration_text: '3hrs', description: 'A striking, defined style mimicking the spiky lash look of anime characters. Perfect for a doll-like, captivating gaze.', is_active: true, created_at: '', sort_order: 14, image_url: null },
  { id: 'l9', name: 'Lash removal', slug: 'lash-removal', category: 'lash', price: 5000, duration_minutes: 30, duration_text: '30m', description: 'A gentle and safe professional removal of your lash extensions, ensuring the health and integrity of your natural lashes.', is_active: true, created_at: '', sort_order: 15, image_url: null },

  // LASH REFILL
  { id: 'r1', name: 'Volume set refill', slug: 'volume-set-refill', category: 'lash-refill', price: 14000, duration_minutes: 0, description: 'Maintenance to replace outgrown volume lashes and fill in gaps, restoring your set to its original fluffy glory.', is_active: true, created_at: '', sort_order: 16, image_url: null },
  { id: 'r2', name: 'Hybrid refill', slug: 'hybrid-refill', category: 'lash-refill', price: 11500, duration_minutes: 0, description: 'A customized top-up of your classic and volume fans to refresh your textured, hybrid look and keep it flawless.', is_active: true, created_at: '', sort_order: 17, image_url: null }
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
