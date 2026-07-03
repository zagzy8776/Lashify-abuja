import fs from 'fs';

const filePath = 'e:/Lashify-abuja-main/Lashify-abuja-main/src/components/Admin.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const servicesManagerStr = `function ServicesManager({ services, setServices, toggleServiceActive, checkAuth }: {
  services: Service[];
  setServices: (services: Service[]) => void;
  toggleServiceActive: (id: string, isActive: boolean) => void;
  checkAuth: (err: unknown) => void;
}) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);

  const [newItem, setNewItem] = useState<Partial<Service>>({ name: '', description: '', price: 0, duration_minutes: 60, category: 'lashes', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const token = localStorage.getItem('admin_token');
        const response = await fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/upload\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`,
          },
          body: JSON.stringify({ file: base64String }),
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        
        if (isEdit) {
          setEditForm({ ...editForm, image_url: data.url });
        } else {
          setNewItem({ ...newItem, image_url: data.url });
        }
        setUploadProgress(100);
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddService = async () => {
    if (!newItem.name?.trim() || !newItem.price || !newItem.duration_minutes) return;
    setSaving(true);
    try {
      const data = await adminCreateService(newItem);
      setServices([...services, data]);
      setNewItem({ name: '', description: '', price: 0, duration_minutes: 60, category: 'lashes', image_url: '' });
    } catch (err) {
      console.error('Failed to create service:', err);
      checkAuth(err);
      alert('Failed to add service.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
      category: service.category,
      image_url: service.image_url,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingService) return;
    setSaving(true);
    try {
      await adminUpdateService(editingService.id, editForm);
      setServices(services.map((s) => s.id === editingService.id ? { ...s, ...editForm } : s));
      setEditingService(null);
      setEditForm({});
    } catch (err) {
      console.error('Failed to update service:', err);
      checkAuth(err);
      alert('Failed to update service. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(\`Are you sure you want to delete "\${name}"? This action cannot be undone.\`)) return;
    try {
      await adminDeleteService(id);
      setServices(services.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
      checkAuth(err);
      alert('Failed to delete service. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Service Section */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#371c14' }}>Add New Service</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Service Name</label>
              <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="input-lux" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Category</label>
              <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="input-lux">
                <option value="lashes">Lashes</option>
                <option value="brows">Brows</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Description</label>
            <textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="input-lux min-h-[60px]" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Price (₦)</label>
              <input type="number" value={newItem.price || ''} onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})} className="input-lux" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Duration (min)</label>
              <input type="number" value={newItem.duration_minutes || ''} onChange={(e) => setNewItem({...newItem, duration_minutes: Number(e.target.value)})} className="input-lux" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#6a686c' }}>Upload Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} className="input-lux" />
            {uploading && <div className="mt-2 text-sm" style={{ color: '#cd738d' }}>Uploading... {uploadProgress}%</div>}
          </div>
          {newItem.image_url && (
            <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(205,115,141,0.2)' }}>
              <img src={newItem.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <button onClick={handleAddService} disabled={saving || !newItem.name?.trim() || !newItem.price} className="btn-gold text-sm disabled:opacity-50 mt-4">
            {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : 'Add Service'}
          </button>
        </div>
      </div>

      {/* List Services Section */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.7)', border: '1px solid rgba(205,115,141,0.12)' }}>
        <h3 className="font-serif text-xl mb-5" style={{ color: '#371c14' }}>Manage Services</h3>
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,115,141,0.1)' }}>
              <div className="flex-grow flex items-center gap-4">
                {svc.image_url && (
                  <img src={svc.image_url} alt={svc.name} className="w-16 h-16 object-cover rounded-lg" style={{ border: '1px solid rgba(205,115,141,0.2)' }} />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium" style={{ color: '#371c14' }}>{svc.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: svc.is_active ? 'rgba(60,180,60,0.15)' : 'rgba(255,255,255,0.05)', color: svc.is_active ? '#6be06b' : '#39383b' }}>
                      {svc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#39383b' }}>{svc.description}</p>
                  <p className="text-sm mt-1" style={{ color: '#39383b' }}>{formatDuration(svc.duration_minutes)} • {formatNaira(svc.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(svc)} className="p-2 rounded-lg transition-colors hover:bg-opacity-80" style={{ background: 'rgba(205,115,141,0.15)', color: '#cd738d' }} title="Edit service"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(svc.id, svc.name)} className="p-2 rounded-lg transition-colors hover:bg-opacity-80" style={{ background: 'rgba(200,60,60,0.1)', color: 'rgba(200,80,80,0.8)' }} title="Delete service"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => toggleServiceActive(svc.id, svc.is_active)} className="relative w-11 h-6 rounded-full transition-colors" style={{ background: svc.is_active ? '#cd738d' : 'rgba(255,255,255,0.1)' }} title={svc.is_active ? 'Deactivate' : 'Activate'}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full transition-transform" style={{ background: '#371c14', transform: svc.is_active ? 'translateX(20px)' : 'translateX(2px)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,8,6,0.85)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6" style={{ background: 'rgba(27,26,28,0.98)', border: '1px solid rgba(205,115,141,0.2)' }}>
            <h3 className="font-serif text-2xl mb-6" style={{ color: '#371c14' }}>Edit Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Service Name</label>
                <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-lux" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Description</label>
                <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-lux min-h-[100px]" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Price (₦)</label>
                  <input type="number" value={editForm.price || ''} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Duration (min)</label>
                  <input type="number" value={editForm.duration_minutes || ''} onChange={(e) => setEditForm({ ...editForm, duration_minutes: Number(e.target.value) })} className="input-lux" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Category</label>
                  <select value={editForm.category || 'lashes'} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="input-lux">
                    <option value="lashes">Lashes</option>
                    <option value="brows">Brows</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a686c' }}>Upload Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} className="input-lux" />
                {uploading && <div className="mt-2 text-sm" style={{ color: '#cd738d' }}>Uploading... {uploadProgress}%</div>}
              </div>
              {editForm.image_url && (
                <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden" style={{ border: '1px solid rgba(205,115,141,0.2)' }}>
                  <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEdit} disabled={saving || !editForm.name?.trim()} className="flex-1 btn-gold disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Save Changes'}
              </button>
              <button onClick={() => { setEditingService(null); setEditForm({}); }} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.04)', color: '#6a686c', border: '1px solid rgba(205,115,141,0.1)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

const startRegex = /function ServicesManager.*?{/s;
const startMatch = content.match(startRegex);
if (startMatch) {
  const startIndex = startMatch.index;
  // find the end of the function. It's right before function ReviewsManager
  const endMatch = content.match(/function ReviewsManager/);
  if (endMatch) {
    const endIndex = endMatch.index;
    content = content.substring(0, startIndex) + servicesManagerStr + "\n\n" + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Successfully updated ServicesManager');
  }
}
