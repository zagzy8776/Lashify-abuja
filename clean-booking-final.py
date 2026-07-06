import re

with open("src/components/Booking.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace all remaining hex codes that belong to the old theme
content = re.sub(r"'#b38b9e'", "'#f43f5e'", content) # rose-500 equivalent if used directly
content = re.sub(r"'#8f7882'", "'#6b7280'", content) # gray-500
content = re.sub(r"rgba\(179,\s*139,\s*158,\s*[\d.]+\)", "#ffe4e6", content) # rose-100/50 fallback
content = re.sub(r"rgba\(74,\s*35,\s*17,\s*[\d.]+\)", "#e5e7eb", content) # gray-200

with open("src/components/Booking.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done final cleanup")
