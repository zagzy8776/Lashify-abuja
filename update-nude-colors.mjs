import fs from 'fs';
import path from 'path';

const srcDir = './src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // BACKGROUNDS (Dark to Nude)
  content = content.replace(/#0a0806/gi, '#cba495');
  content = content.replace(/10\s*,\s*8\s*,\s*6/g, '203,164,149'); // rgb

  content = content.replace(/#151416/gi, '#d5b1a3');
  content = content.replace(/21\s*,\s*20\s*,\s*22/g, '213,177,163'); // rgb

  content = content.replace(/#1b1a1c/gi, '#dfbfae');
  content = content.replace(/27\s*,\s*26\s*,\s*28/g, '223,191,174'); // rgb

  content = content.replace(/#272628/gi, '#e9cdbf');
  content = content.replace(/39\s*,\s*38\s*,\s*40/g, '233,205,191'); // rgb

  // ACCENTS (Gold to Chocolate)
  content = content.replace(/#c5b358/gi, '#4a2311');
  content = content.replace(/197\s*,\s*179\s*,\s*88/g, '74,35,17'); // rgb

  content = content.replace(/#b89f5d/gi, '#3a1c0d');
  content = content.replace(/#e6d795/gi, '#5e311a');

  // TEXT (Light to Dark Chocolate/Caramel)
  content = content.replace(/#f9f6f0/gi, '#3a1c0d'); // Primary text
  content = content.replace(/#fdf8f9/gi, '#3a1c0d'); 
  
  content = content.replace(/#989599/gi, '#5e311a'); // Secondary text
  content = content.replace(/#6a686c/gi, '#7a4428'); // Muted text
  content = content.replace(/#39383b/gi, '#965d3e'); // Very muted text

  // BUTTON TEXT (Was #371c14 on gold, now make it nude on chocolate)
  content = content.replace(/#371c14/gi, '#f4e6e0');

  // OVERLAYS (Lighten the subtle white borders/bgs for better visibility on nude)
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'rgba(255,255,255,0.4)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.04\)/g, 'rgba(255,255,255,0.5)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'rgba(255,255,255,0.6)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'rgba(255,255,255,0.7)');

  // Fix tailwind classes if any (e.g. text-white -> text-[#3a1c0d])
  content = content.replace(/text-white/g, 'text-[#3a1c0d]');
  // but keep the text-white on the notification badges
  content = content.replace(/text-\[#3a1c0d\] text-\[10px\]/g, 'text-white text-[10px]'); // ugly hack for Admin.tsx badge

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
