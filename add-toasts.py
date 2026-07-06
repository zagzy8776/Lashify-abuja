import re

with open("src/components/Admin.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import { toast } from 'react-hot-toast';" not in content:
    content = content.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { toast } from 'react-hot-toast';")

content = content.replace("alert('Failed to delete appointment.');", "toast.error('Failed to delete appointment.');")
content = content.replace("alert('Failed to update appointment details.');", "toast.error('Failed to update appointment details.');")
content = content.replace("alert('Failed to upload image. Please try again.');", "toast.error('Failed to upload image. Please try again.');")
content = content.replace("alert('Failed to save service.');", "toast.error('Failed to save service.');")
content = content.replace("alert('Failed to delete service.');", "toast.error('Failed to delete service.');")
content = content.replace("alert('Failed to delete review.');", "toast.error('Failed to delete review.');")

content = content.replace("setItems([data, ...items]);", "setItems([data, ...items]);\n      toast.success('Gallery image added successfully!');")
content = content.replace("setItems(items.map((i) => i.id === editingItem.id ? editingItem : i));", "setItems(items.map((i) => i.id === editingItem.id ? editingItem : i));\n      toast.success('Gallery image updated!');")
content = content.replace("setItems(items.filter((i) => i.id !== itemToDelete.id));", "setItems(items.filter((i) => i.id !== itemToDelete.id));\n      toast.success('Image deleted from gallery.');")

content = content.replace("setAppointments(appointments.filter(a => a.id !== aptToDelete.id));", "setAppointments(appointments.filter(a => a.id !== aptToDelete.id));\n      toast.success('Appointment deleted successfully.');")
content = content.replace("setAppointments(appointments.map(a => a.id === updated.id ? updated : a));", "setAppointments(appointments.map(a => a.id === updated.id ? updated : a));\n      toast.success('Appointment updated successfully.');")

content = content.replace("setServices([created, ...services]);", "setServices([created, ...services]);\n      toast.success('Service added successfully!');")
content = content.replace("setServices(services.map((s) => s.id === editingService.id ? updated : s));", "setServices(services.map((s) => s.id === editingService.id ? updated : s));\n      toast.success('Service updated successfully!');")
content = content.replace("setServices(services.filter((s) => s.id !== serviceToDelete.id));", "setServices(services.filter((s) => s.id !== serviceToDelete.id));\n      toast.success('Service deleted successfully.');")

content = content.replace("setReviews(reviews.map((r) => r.id === editingReview.id ? updated : r));", "setReviews(reviews.map((r) => r.id === editingReview.id ? updated : r));\n      toast.success('Review approved successfully!');")
content = content.replace("setReviews(reviews.filter((r) => r.id !== reviewToDelete.id));", "setReviews(reviews.filter((r) => r.id !== reviewToDelete.id));\n      toast.success('Review deleted successfully.');")

content = content.replace("setServices(services.map((s) => s.id === id ? { ...s, is_active: !isActive } : s));", "setServices(services.map((s) => s.id === id ? { ...s, is_active: !isActive } : s));\n      toast.success(isActive ? 'Service deactivated' : 'Service activated');")

with open("src/components/Admin.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done toasts")
