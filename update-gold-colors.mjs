import fs from 'fs';
import path from 'path';

const srcDir = './src';

// Faded gold: #c5b358 (RGB: 197, 179, 88)
// Darker faded gold (for hover/borders): #b89f5d (RGB: 184, 159, 93)

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

  // Replace pink hexes with faded gold hexes
  content = content.replace(/#cd738d/gi, '#c5b358');
  content = content.replace(/#b2506e/gi, '#b89f5d');
  content = content.replace(/#df9db1/gi, '#e6d795');

  // Replace RGB values used in rgba() strings
  // 205,115,141 -> 197,179,88
  content = content.replace(/205\s*,\s*115\s*,\s*141/g, '197,179,88');

  // Specific CSS overrides for .btn-gold text color to ensure contrast
  if (file.endsWith('index.css')) {
    content = content.replace(
      'color: #fdf8f9; /* btn-gold */',
      'color: #371c14;'
    );
    // Let's just directly replace the color block in .btn-gold if it exists
    content = content.replace(
      /(\.btn-gold\s*{[\s\S]*?color:\s*)#[a-fA-F0-9]+;/g,
      '$1#371c14;'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
