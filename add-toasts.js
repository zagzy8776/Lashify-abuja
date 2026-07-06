const fs = require('fs');
let content = fs.readFileSync('src/components/Admin.tsx', 'utf8');

if (!content.includes("import { toast } from 'react-hot-toast';")) {
    content = content.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { toast } from 'react-hot-toast';");
}

// Replace alerts with toast.error
content = content.replace(/alert\('Failed to delete appointment.'\);/g, "toast.error('Failed to delete appointment.');");
content = content.replace(/alert\('Failed to update appointment details.'\);/g, "toast.error('Failed to update appointment details.');");
content = content.replace(/alert\('Failed to upload image. Please try again.'\);/g, "toast.error('Failed to upload image. Please try again.');");
content = content.replace(/alert\('Failed to save service.'\);/g, "toast.error('Failed to save service.');");
content = content.replace(/alert\('Failed to delete service.'\);/g, "toast.error('Failed to delete service.');");
content = content.replace(/alert\('Failed to delete review.'\);/g, "toast.error('Failed to delete review.');");

// Add toast.success for actions
content = content.replace(/setItems\(\[data, \.\.\.items\]\);/g, "setItems([data, ...items]);\n      toast.success('Gallery image added successfully!');");
content = content.replace(/setItems\(items\.map\(\(i\) => i\.id === editingItem\.id \? editingItem : i\)\);/g, "setItems(items.map((i) => i.id === editingItem.id ? editingItem : i));\n      toast.success('Gallery image updated!');");
content = content.replace(/setItems\(items\.filter\(\(i\) => i\.id !== itemToDelete\.id\)\);/g, "setItems(items.filter((i) => i.id !== itemToDelete.id));\n      toast.success('Image deleted from gallery.');");

content = content.replace(/setAppointments\(appointments\.filter\(a => a\.id !== aptToDelete\.id\)\);/g, "setAppointments(appointments.filter(a => a.id !== aptToDelete.id));\n      toast.success('Appointment deleted successfully.');");
content = content.replace(/setAppointments\(appointments\.map\(a => a\.id === updated\.id \? updated : a\)\);/g, "setAppointments(appointments.map(a => a.id === updated.id ? updated : a));\n      toast.success('Appointment updated successfully.');");

content = content.replace(/setServices\(\[created, \.\.\.services\]\);/g, "setServices([created, ...services]);\n      toast.success('Service added successfully!');");
content = content.replace(/setServices\(services\.map\(\(s\) => s\.id === editingService\.id \? updated : s\)\);/g, "setServices(services.map((s) => s.id === editingService.id ? updated : s));\n      toast.success('Service updated successfully!');");
content = content.replace(/setServices\(services\.filter\(\(s\) => s\.id !== serviceToDelete\.id\)\);/g, "setServices(services.filter((s) => s.id !== serviceToDelete.id));\n      toast.success('Service deleted successfully.');");

content = content.replace(/setReviews\(reviews\.map\(\(r\) => r\.id === editingReview\.id \? updated : r\)\);/g, "setReviews(reviews.map((r) => r.id === editingReview.id ? updated : r));\n      toast.success('Review approved successfully!');");
content = content.replace(/setReviews\(reviews\.filter\(\(r\) => r\.id !== reviewToDelete\.id\)\);/g, "setReviews(reviews.filter((r) => r.id !== reviewToDelete.id));\n      toast.success('Review deleted successfully.');");

// Toggling active/inactive
content = content.replace(/setServices\(services\.map\(\(s\) => s\.id === id \? \{ \.\.\.s, is_active: !isActive \} : s\)\);/g, "setServices(services.map((s) => s.id === id ? { ...s, is_active: !isActive } : s));\n      toast.success(isActive ? 'Service deactivated' : 'Service activated');");

fs.writeFileSync('src/components/Admin.tsx', content);
console.log("Admin toasts added.");
