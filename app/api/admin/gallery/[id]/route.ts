import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function getPublicIdFromUrl(url: string) {
  try {
    // E.g., https://res.cloudinary.com/.../upload/v1234/lashify-abuja/abcde.jpg
    // We want 'lashify-abuja/abcde'
    const parts = url.split('/');
    const folderIndex = parts.indexOf('lashify-abuja');
    
    if (folderIndex !== -1) {
      const pathWithExt = parts.slice(folderIndex).join('/');
      return pathWithExt.substring(0, pathWithExt.lastIndexOf('.'));
    }
    
    // Fallback logic
    return parts.pop()?.split('.')[0];
  } catch (err) {
    return null;
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const item = await prisma.galleryItem.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // 1. Get the item to find Cloudinary URL
    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (item && item.image_url && item.image_url.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(item.image_url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // We continue to delete from DB even if Cloudinary fails
        }
      }
    }
    
    // 2. Delete from DB
    await prisma.galleryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

