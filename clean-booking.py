import re

with open("src/components/Booking.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r" style=\{\{ color: '#3d2e36' \}\}", " className='text-gray-900'", content)
content = re.sub(r" style=\{\{ color: '#b38b9e' \}\}", " className='text-rose-500'", content)
content = re.sub(r" style=\{\{ color: '#5a4850' \}\}", " className='text-gray-700'", content)
content = re.sub(r" style=\{\{ background: 'rgba\(179, 139, 158, 0\.5\)' \}\}", " className='bg-rose-200'", content)
content = re.sub(r" style=\{\{ background: 'rgba\(179, 139, 158, 0\.08\)'(?:, border: '[^']+')? \}\}", " className='bg-rose-50'", content)
content = re.sub(r" style=\{\{ background: 'rgba\(74,35,17,0\.06\)', border: '1px solid rgba\(179, 139, 158, 0\.3\)' \}\}", " className='bg-gray-50 border border-rose-200'", content)
content = re.sub(r" style=\{\{ borderBottom: '1px solid rgba\(179, 139, 158, 0\.08\)' \}\}", " className='border-b border-rose-100'", content)
content = re.sub(r" style=\{\{ boxShadow: '0 20px 80px rgba\(0,0,0,0\.8\), 0 0 0 1px rgba\(179, 139, 158, 0\.2\)' \}\}", " className='shadow-2xl border border-rose-100'", content)
content = re.sub(r" style=\{\{ background: 'rgba\(203,164,149,0\.6\)', border: '1px solid rgba\(179, 139, 158, 0\.08\)' \}\}", " className='bg-rose-50 border border-rose-100'", content)
content = re.sub(r" style=\{\{ background: 'rgba\(200,60,60,0\.06\)', border: '1px solid rgba\(200,60,60,0\.15\)' \}\}", " className='bg-red-50 border border-red-200'", content)
content = re.sub(r" style=\{\{ color: 'rgba\(200,80,80,0\.7\)' \}\}", " className='text-red-500'", content)
content = re.sub(r" style=\{\{ color: 'rgba\(200,100,100,0\.8\)' \}\}", " className='text-red-600'", content)
content = re.sub(r" style=\{\{ color: '#8f7882' \}\}", " className='text-gray-500'", content)

# This one uses idx < currentStepIndex
content = re.sub(r" style=\{\{ background: idx < currentStepIndex \? '#b38b9e' : 'rgba\(179, 139, 158, 0\.08\)' \}\}", " className={idx < currentStepIndex ? 'bg-rose-500' : 'bg-rose-100'}", content)

with open("src/components/Booking.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done python")
