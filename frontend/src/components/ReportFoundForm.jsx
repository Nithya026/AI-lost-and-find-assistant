import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Upload, 
  MapPin, 
  Calendar, 
  Mail, 
  FileText, 
  Tag, 
  Sparkles, 
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  "Electronics",
  "Personal Items",
  "Documents & IDs",
  "Clothing & Accessories",
  "Keys & Lanyards",
  "Bags & Backpacks",
  "Other"
];

export default function ReportFoundForm({ onSubmitSuccess, onCancel, token }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [locationFound, setLocationFound] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [collectionInstructions, setCollectionInstructions] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !locationFound) {
      setError('Please fill in all required fields (Description and Location Found).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name || 'Found Item');
      formData.append('category', category);
      formData.append('description', description);
      formData.append('date_found', dateFound);
      formData.append('location_found', locationFound);
      if (contactInfo) formData.append('contact_info', contactInfo);
      if (collectionInstructions) formData.append('collection_instructions', collectionInstructions);
      if (imageFile) formData.append('image', imageFile);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/items/found', {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to submit found item report');
      }

      onSubmitSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-10 rounded-3xl border border-emerald-500/20 shadow-2xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-outfit">Report a Found Item</h2>
            <p className="text-xs text-slate-400">Turn in recovered items to trigger automated owner email alerts</p>
          </div>
        </div>

        {onCancel && (
          <button 
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        
        {/* Item Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Found Item Title / Brief Descriptor
            </label>
            <input
              type="text"
              placeholder="e.g. Found Black Wireless Earbuds"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Item Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Detailed Item Description *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe condition, exact visual markings, sticker details, brand..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Date Found & Location Found */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Date Found *
            </label>
            <input
              type="date"
              required
              value={dateFound}
              onChange={(e) => setDateFound(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Location Found *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Student Union Cafeteria, Table 4"
              value={locationFound}
              onChange={(e) => setLocationFound(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Collection Location & Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Collection Instructions & Storage Point
          </label>
          <input
            type="text"
            placeholder="e.g. Turn in at Campus Security Desk 1B, Building A (Mon-Fri 8 AM - 5 PM)"
            value={collectionInstructions}
            onChange={(e) => setCollectionInstructions(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Finder Contact Info */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            Finder Contact Info / Staff Desk Email
          </label>
          <input
            type="text"
            placeholder="e.g. security-office@institution.edu"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            Upload Found Item Photo (FAISS visual vector matching)
          </label>
          
          <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-900/50 transition-colors cursor-pointer group">
            <input 
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {imagePreview ? (
              <div className="relative max-w-xs mx-auto">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 rounded-xl object-cover mx-auto border border-slate-700 shadow-md"
                />
                <span className="inline-block mt-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Found Item Photo Attached
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Upload crisp photo of recovered item
                </p>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, WEBP formats supported
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Processing AI Vector Match...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Found Item & Auto-Dispatch Email
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
