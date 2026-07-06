import sharp from 'sharp';
import { existsSync } from 'fs';

const dir = './public/images';

async function optimize() {
  const tasks = [
    // Logo: PNG→WebP, keep alpha, quality 85
    {
      input: `${dir}/logo.png`,
      output: `${dir}/logo.webp`,
      opts: { quality: 85 },
      label: 'logo.png → logo.webp'
    },
    // Hero: PNG→WebP, quality 80, resize max 1200px wide
    {
      input: `${dir}/luxury_model_hero.png`,
      output: `${dir}/luxury_model_hero.webp`,
      resize: { width: 1200, withoutEnlargement: true },
      opts: { quality: 80 },
      label: 'luxury_model_hero.png → luxury_model_hero.webp'
    },
    // Studio/fallback JPGs
    {
      input: `${dir}/studio.jpg`,
      output: `${dir}/studio.webp`,
      resize: { width: 800, withoutEnlargement: true },
      opts: { quality: 82 },
      label: 'studio.jpg → studio.webp'
    },
    // WhatsApp image
    {
      input: `${dir}/WhatsApp_Image_2026-06-30_at_2.12.44_PM.jpeg`,
      output: `${dir}/og-image.webp`,
      resize: { width: 1200, withoutEnlargement: true },
      opts: { quality: 82 },
      label: 'WhatsApp image → og-image.webp'
    },
  ];

  for (const task of tasks) {
    if (!existsSync(task.input)) {
      console.log(`⚠️  Skipping (not found): ${task.input}`);
      continue;
    }
    let pipeline = sharp(task.input);
    if (task.resize) pipeline = pipeline.resize(task.resize);
    await pipeline.webp(task.opts).toFile(task.output);
    const { size: inSize } = await import('fs').then(m => m.promises.stat(task.input));
    const { size: outSize } = await import('fs').then(m => m.promises.stat(task.output));
    const saved = Math.round((1 - outSize / inSize) * 100);
    console.log(`✅ ${task.label} | ${Math.round(inSize/1024)}KB → ${Math.round(outSize/1024)}KB (${saved}% smaller)`);
  }
  console.log('\n🎉 Image optimization complete!');
}

optimize().catch(console.error);
