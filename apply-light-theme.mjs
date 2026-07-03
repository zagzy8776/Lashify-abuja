import fs from 'fs';
import path from 'path';

const dir = 'e:/Lashify-abuja-main/Lashify-abuja-main/src';

const replacements = [
  // Renaming section classes for semantic correctness
  { search: /section-dark/g, replace: 'section-light' },
  { search: /section-brown/g, replace: 'section-cream' },
  { search: /section-mid/g, replace: 'section-blush' },
  // App.tsx specific main bg
  { search: /style={{ background: '#151416' }}/g, replace: "style={{ background: '#fcf9f8' }}" },
  // Hero.tsx radial gradient
  { search: /#1e1b1d 0%, #151416 70%/g, replace: '#f8f1ee 0%, #fcf9f8 70%' }
];

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;
      for (const { search, replace } of replacements) {
        if (search.test(content)) {
          content = content.replace(search, replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk(dir);
console.log('Done applying light theme to TSX files.');
