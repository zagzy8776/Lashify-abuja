import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from './db.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Admin credentials (in production, store in database)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lashifyabuja.com';
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
if (!ADMIN_PASSWORD_HASH) {
  const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
  ADMIN_PASSWORD_HASH = bcrypt.hashSync(plainPassword, 10);
}

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Public API endpoints

// GET /api/services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE is_active = true ORDER BY sort_order, name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/time-slots
app.get('/api/time-slots', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM time_slots WHERE is_active = true ORDER BY day_of_week'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

// GET /api/appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { date } = req.query;
    let query = 'SELECT * FROM appointments';
    let params = [];
    
    if (date) {
      query += ' WHERE appointment_date = $1';
      params.push(date);
    }
    
    query += ' ORDER BY appointment_date DESC, start_time';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      client_name,
      client_phone,
      client_email,
      service_name,
      service_price,
      service_duration,
      appointment_date,
      start_time,
      end_time,
      notes
    } = req.body;
    
    // Create or find client
    let clientResult = await client.query(
      'SELECT id FROM clients WHERE phone = $1',
      [client_phone]
    );
    
    let clientId;
    if (clientResult.rows.length === 0) {
      const newClient = await client.query(
        'INSERT INTO clients (name, phone, email) VALUES ($1, $2, $3) RETURNING id',
        [client_name, client_phone, client_email || null]
      );
      clientId = newClient.rows[0].id;
    } else {
      clientId = clientResult.rows[0].id;
    }
    
    // Create appointment
    const appointmentResult = await client.query(
      `INSERT INTO appointments 
       (client_id, client_name, client_phone, client_email, service_name, service_price, service_duration, appointment_date, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [clientId, client_name, client_phone, client_email || null, service_name, service_price, service_duration, appointment_date, start_time, end_time, notes || null]
    );
    
    await client.query('COMMIT');
    res.json(appointmentResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  } finally {
    client.release();
  }
});

// PATCH /api/appointments/:id/status
app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// GET /api/gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gallery_items ORDER BY sort_order, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// GET /api/reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE is_published = true ORDER BY created_at DESC LIMIT 6'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews
app.post('/api/reviews', async (req, res) => {
  try {
    const { client_name, rating, comment, service_id } = req.body;
    const result = await pool.query(
      'INSERT INTO reviews (client_name, rating, comment, service_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [client_name, rating, comment, service_id || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Admin endpoints

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !ADMIN_EMAIL || email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/admin/appointments
app.get('/api/admin/appointments', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments ORDER BY appointment_date DESC, start_time'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/admin/services
app.get('/api/admin/services', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services ORDER BY sort_order, name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// PATCH /api/admin/services/:id
app.patch('/api/admin/services/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, duration_minutes, category, is_active, sort_order } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
      
      // Auto-generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      updates.push(`slug = $${paramCount}`);
      values.push(slug);
      paramCount++;
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    
    if (price !== undefined) {
      updates.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }
    
    if (duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramCount}`);
      values.push(duration_minutes);
      paramCount++;
    }
    
    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }
    
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramCount}`);
      values.push(sort_order);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    values.push(req.params.id);
    
    const query = `UPDATE services SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// POST /api/admin/services
app.post('/api/admin/services', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, duration_minutes, category } = req.body;
    if (!name || !price || !duration_minutes || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const query = `
      INSERT INTO services (name, slug, description, price, duration_minutes, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [name, slug, description || '', price, duration_minutes, category]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// DELETE /api/admin/services/:id
app.delete('/api/admin/services/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// GET /api/admin/gallery
app.get('/api/admin/gallery', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gallery_items ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// POST /api/admin/gallery
app.post('/api/admin/gallery', verifyAdmin, async (req, res) => {
  try {
    const { title, category, image_url, description, is_featured, sort_order } = req.body;
    const result = await pool.query(
      'INSERT INTO gallery_items (title, category, image_url, description, is_featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, category, image_url, description || null, is_featured || false, sort_order || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding gallery item:', error);
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

// POST /api/admin/upload - Cloudinary signed upload
app.post('/api/admin/upload', verifyAdmin, async (req, res) => {
  try {
    const { file } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: 'lashify-abuja',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      max_file_size: 5000000, // 5MB
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, height: 1200, crop: 'limit' }
      ]
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// DELETE /api/admin/gallery/:id
app.delete('/api/admin/gallery/:id', verifyAdmin, async (req, res) => {
  try {
    // Get the gallery item to delete the image from Cloudinary
    const itemResult = await pool.query('SELECT * FROM gallery_items WHERE id = $1', [req.params.id]);
    
    if (itemResult.rows.length > 0) {
      const item = itemResult.rows[0];
      // Extract public_id from image_url if it's a Cloudinary URL
      if (item.image_url.includes('cloudinary.com')) {
        const publicId = item.image_url.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`lashify-abuja/${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // Continue with database deletion even if Cloudinary delete fails
        }
      }
    }
    
    await pool.query('DELETE FROM gallery_items WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// GET /api/admin/reviews
app.get('/api/admin/reviews', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// PATCH /api/admin/reviews/:id
app.patch('/api/admin/reviews/:id', verifyAdmin, async (req, res) => {
  try {
    const { is_published } = req.body;
    const result = await pool.query(
      'UPDATE reviews SET is_published = $1 WHERE id = $2 RETURNING *',
      [is_published, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/admin/reviews/:id
app.delete('/api/admin/reviews/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
