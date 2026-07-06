import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src', 'components');

const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace primary black buttons with elegant rose/pink
  content = content.replace(/bg-black/g, 'bg-rose-500');
  content = content.replace(/hover:bg-gray-800/g, 'hover:bg-rose-600');
  
  // Replace dark grey text with rose for some accents if needed (optional)
  // Or maybe border-black to border-rose-500
  content = content.replace(/border-black/g, 'border-rose-500');
  content = content.replace(/focus:border-black/g, 'focus:border-rose-500');
  content = content.replace(/focus:ring-black/g, 'focus:ring-rose-500');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

console.log('Successfully applied pink (rose) accents to the white theme!');
