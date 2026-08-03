import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Tag, 
  Clock,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  "All",
  "Electronics",
  "Personal Items",
  "Documents & IDs",
  "Clothing & Accessories",
  "Keys & Lanyards",
  "Bags & Backpacks",
  "Other"
];

export default function BrowseCatalog({ token }) {
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [activeTab, category, searchTerm]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'lost' ? '/api/items/lost' : '/api/items/found';
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${endpoint}?${params.toString()}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching catalog items:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Toggle Lost vs Found */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('lost')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'lost'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              Lost Items Catalog
            </button>

            <button
              onClick={() => setActiveTab('found')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Found Items Catalog
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={`Search ${activeTab} items...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-slate-800/80">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading vector database entries...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No items found matching criteria</h3>
          <p className="text-xs text-slate-400">Try clearing filters or changing search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={item.image_url || "https://via.placeholder.com/350x200?text=No+Photo"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 right-3 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border shadow-md ${
                    item.status === 'claimed'
                      ? 'bg-emerald-900/90 text-emerald-300 border-emerald-500/40'
                      : item.status === 'matched'
                      ? 'bg-amber-900/90 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700'
                  }`}>
                    {item.status}
                  </span>
                  
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                    {item.category}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white font-outfit line-clamp-1">
                    {item.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{activeTab === 'lost' ? item.location : item.location_found}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{activeTab === 'lost' ? `Lost on ${item.date_lost}` : `Found on ${item.date_found}`}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5 pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  ID #{item.id}
                </span>
                <span className="font-medium text-slate-300">
                  {item.contact_email || item.contact_info || "Contact Admin"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
