const fs = require('fs');
let content = fs.readFileSync('src/components/Booking.tsx', 'utf8');

content = content.replace(/ style=\{\{ color: '#3d2e36' \}\}/g, " className='text-gray-900'");
content = content.replace(/ style=\{\{ color: '#b38b9e' \}\}/g, " className='text-rose-500'");
content = content.replace(/ style=\{\{ color: '#5a4850' \}\}/g, " className='text-gray-700'");
content = content.replace(/ style=\{\{ background: 'rgba\\(179, 139, 158, 0\\.5\\)' \}\}/g, " className='bg-rose-200'");
content = content.replace(/ style=\{\{ background: 'rgba\\(179, 139, 158, 0\\.08\\)'(?:, border: '[^']+')? \}\}/g, " className='bg-rose-50'");
content = content.replace(/ style=\{\{ background: 'rgba\\(74,35,17,0\\.06\\)', border: '1px solid rgba\\(179, 139, 158, 0\\.3\\)' \}\}/g, " className='bg-gray-50 border border-rose-200'");
content = content.replace(/ style=\{\{ borderBottom: '1px solid rgba\\(179, 139, 158, 0\\.08\\)' \}\}/g, " className='border-b border-rose-100'");
content = content.replace(/ style=\{\{ boxShadow: '0 20px 80px rgba\\(0,0,0,0\\.8\\), 0 0 0 1px rgba\\(179, 139, 158, 0\\.2\\)' \}\}/g, " className='shadow-2xl border border-rose-100'");
content = content.replace(/ style=\{\{ background: 'rgba\\(203,164,149,0\\.6\\)', border: '1px solid rgba\\(179, 139, 158, 0\\.08\\)' \}\}/g, " className='bg-rose-50 border border-rose-100'");
content = content.replace(/ style=\{\{ background: 'rgba\\(200,60,60,0\\.06\\)', border: '1px solid rgba\\(200,60,60,0\\.15\\)' \}\}/g, " className='bg-red-50 border border-red-200'");
content = content.replace(/ style=\{\{ color: 'rgba\\(200,80,80,0\\.7\\)' \}\}/g, " className='text-red-500'");
content = content.replace(/ style=\{\{ color: 'rgba\\(200,100,100,0\\.8\\)' \}\}/g, " className='text-red-600'");
content = content.replace(/ style=\{\{ color: '#8f7882' \}\}/g, " className='text-gray-500'");
content = content.replace(/ style=\{\{ background: idx < currentStepIndex \? '#b38b9e' : 'rgba\\(179, 139, 158, 0\\.08\\)' \}\}/g, " className={idx < currentStepIndex ? 'bg-rose-500' : 'bg-rose-100'}");

fs.writeFileSync('src/components/Booking.tsx', content);
console.log("Colors cleaned.");
