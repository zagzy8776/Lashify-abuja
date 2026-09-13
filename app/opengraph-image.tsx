import { ImageResponse } from 'next/og';

export const alt = 'Lashify Abuja — Premium Lash Studio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: '#faf5f0',
        color: '#3d2e36',
      }}
    >
      <div style={{ fontSize: 30, letterSpacing: 4, textTransform: 'uppercase' }}>Lashify Abuja</div>
      <div style={{ fontSize: 68, fontWeight: 800, marginTop: 24, maxWidth: 900 }}>Premium Lash Studio in Abuja</div>
      <div style={{ fontSize: 30, marginTop: 24, color: '#8f7882' }}>Lash extensions · Lash refills · Brow artistry</div>
    </div>,
    size,
  );
}
