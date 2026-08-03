import React, { useState } from 'react';
import { 
  Package, 
  Upload, 
  MapPin, 
  Calendar, 
  Mail, 
  FileText, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
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

export default function ReportLostForm({ onSubmitSuccess, onCancel, token }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
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
    if (!name || !description || !location) {
      setError('Please fill in all required fields (Item Name, Description, Location).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('date_lost', dateLost);
      formData.append('location', location);
      if (contactEmail) formData.append('contact_email', contactEmail);
      if (imageFile) formData.append('image', imageFile);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/items/lost', {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to submit lost report');
      }

      onSubmitSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-10 rounded-3xl border border-rose-500/20 shadow-2xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-outfit">Report a Lost Item</h2>
            <p className="text-xs text-slate-400">Our AI will automatically scan for matching found items</p>
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
        
        {/* Item Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apple MacBook Pro 14 inch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Detailed Description *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe colors, brand, distinct marks, serial numbers, case type..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            💡 Rich descriptions significantly boost Sentence Transformer text embedding accuracy!
          </p>
        </div>

        {/* Date Lost & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Date Lost *
            </label>
            <input
              type="date"
              required
              value={dateLost}
              onChange={(e) => setDateLost(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              Last Known Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Science Library, 2nd Floor Quiet Zone"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            Contact Email (for notification dispatch)
          </label>
          <input
            type="email"
            placeholder="e.g. alex.rivera@university.edu"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Upload Item Photo (for OpenCLIP AI Visual Embedding)
          </label>
          
          <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-900/50 transition-colors cursor-pointer group">
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
                <span className="inline-block mt-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Image Ready for OpenCLIP Vectorization
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Click or drag and drop item image here
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports PNG, JPG, WEBP up to 10MB
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
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Generating Vector Embeddings...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Lost Report & Run AI Search
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
