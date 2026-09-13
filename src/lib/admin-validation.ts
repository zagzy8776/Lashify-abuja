import { z } from 'zod';

const id = z.string().uuid();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date');
const nullableUrl = z.string().url().max(2048).nullable().optional();

export const appointmentUpdateSchema = z.object({
  client_name: z.string().trim().min(2).max(120).optional(),
  client_phone: z.string().trim().min(7).max(30).optional(),
  client_email: z.string().email().max(254).nullable().optional(),
  appointment_date: date.optional(),
  start_time: time.optional(),
  notes: z.string().max(2000).nullable().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
}).strict();

export const serviceCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140).optional(),
  description: z.string().trim().min(10).max(1000),
  price: z.coerce.number().finite().nonnegative().max(100000000),
  original_price: z.coerce.number().finite().nonnegative().max(100000000).nullable().optional(),
  duration_minutes: z.coerce.number().int().positive().max(1440),
  duration_text: z.string().trim().max(60).nullable().optional(),
  category: z.string().trim().min(2).max(60),
  image_url: nullableUrl,
  is_active: z.boolean().optional(),
  sort_order: z.coerce.number().int().min(0).max(100000).optional(),
}).strict();

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const galleryCreateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(80),
  image_url: z.string().url().max(2048),
  description: z.string().max(1000).nullable().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.coerce.number().int().min(0).max(100000).optional(),
}).strict();

export const galleryUpdateSchema = galleryCreateSchema.partial();

export const reviewUpdateSchema = z.object({
  client_name: z.string().trim().min(2).max(120).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().min(2).max(3000).optional(),
  service_id: id.nullable().optional(),
  is_published: z.boolean().optional(),
}).strict();

export const bulkPromoSchema = z.object({
  action: z.enum(['apply', 'remove']),
  discountPercentage: z.coerce.number().finite().min(0).max(90).optional(),
}).strict();

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  return schema.parse(body);
}
