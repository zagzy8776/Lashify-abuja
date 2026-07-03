import fs from 'fs';
import path from 'path';

const dir = 'e:/Lashify-abuja-main/Lashify-abuja-main/src';

const replacements = [
  { search: /#d4a827/g, replace: '#cd738d' }, // gold main
  { search: /#e8c45a/g, replace: '#df9db1' }, // gold light
  { search: /#b8891a/g, replace: '#b2506e' }, // gold dark
  { search: /#f0d98a/g, replace: '#f5dce3' },
  { search: /#0a0806/g, replace: '#151416' }, // ink-50
  { search: /#100d09/g, replace: '#1b1a1c' }, // ink-100
  { search: /#160e08/g, replace: '#232225' }, // ink-mid
  { search: /#1a0e06/g, replace: '#1e1b1d' }, 
  { search: /rgba\(16,10,6,/g, replace: 'rgba(27,26,28,' }, 
  { search: /rgba\(16,\s*10,\s*6,/g, replace: 'rgba(27,26,28,' },
  { search: /rgba\(22,14,8,/g, replace: 'rgba(35,34,37,' },
  { search: /rgba\(212,168,39,/g, replace: 'rgba(205,115,141,' },
  { search: /#6b5238/g, replace: '#6a686c' },
  { search: /#a8896e/g, replace: '#989599' },
  { search: /#3d2612/g, replace: '#2d2c2f' },
  { search: /#c9a98c/g, replace: '#e1c4b7' },
  { search: /#4e3219/g, replace: '#39383b' },
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
console.log('Done replacing colors.');
