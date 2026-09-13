import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/src/lib/admin-auth';
import { galleryUpdateSchema } from '@/src/lib/admin-validation';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function getPublicIdFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const publicParts = parts.slice(uploadIndex + 1).filter((part) => !/^v\d+$/.test(part));
    const last = publicParts.pop();
    if (!last) return null;
    publicParts.push(last.replace(/\.[^.]+$/, ''));
    return publicParts.join('/');
  } catch {
    return null;
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = galleryUpdateSchema.parse(await request.json());
    const item = await prisma.galleryItem.update({ where: { id }, data: body });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid gallery data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item = await prisma.galleryItem.findUnique({ where: { id } });

    if (!item) return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });

    if (item.image_url.includes('res.cloudinary.com')) {
      const publicId = getPublicIdFromUrl(item.image_url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          return NextResponse.json({ error: 'Media deletion failed; database item was not removed' }, { status: 502 });
        }
      }
    }

    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
