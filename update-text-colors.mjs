import fs from 'fs';
import path from 'path';

const dir = 'e:/Lashify-abuja-main/Lashify-abuja-main/src';

const replacements = [
  // Replacing light text colors with dark text colors for the light theme
  { search: /#f9f1e8/g, replace: '#371c14' },
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
        console.log('Updated text colors:', fullPath);
      }
    }
  }
}

walk(dir);
console.log('Done updating text colors.');
