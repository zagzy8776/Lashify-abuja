import re

with open("src/components/Booking.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Merge duplicate classNames: className="stuff" className='other-stuff'
# or className="stuff" className="other-stuff"
content = re.sub(r'className="([^"]+)" className=\'([^\']+)\'', r'className="\1 \2"', content)
content = re.sub(r'className="([^"]+)"\s+className=\'([^\']+)\'', r'className="\1 \2"', content)

content = re.sub(r'className=\'([^\']+)\' className="([^"]+)"', r'className="\1 \2"', content)
content = re.sub(r'className=\'([^\']+)\'\s+className="([^"]+)"', r'className="\1 \2"', content)

with open("src/components/Booking.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Merged duplicate classNames")
