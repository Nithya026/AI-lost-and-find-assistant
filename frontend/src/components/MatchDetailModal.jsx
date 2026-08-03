import React from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatchDetailModal({ match, onClose, onClaimMatch, token }) {
  if (!match) return null;

  const handleClaim = async () => {
    try {
      const res = await fetch(`/api/matches/${match.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (res.ok) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
        onClaimMatch(match.id);
        onClose();
      }
    } catch (err) {
      console.error("Error claiming match:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-outfit">
                  Match Analysis Verification
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {match.confidence_level} Confidence
                </span>
              </div>
              <p className="text-xs text-slate-400">Match ID #{match.id} • Evaluated by FAISS FlatIP Vector Index</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Lost Item Card */}
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                🔍 Reported Lost Item
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-semibold px-2 py-0.5 rounded-full border border-rose-500/30">
                {match.lost_item.category}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
              <img 
                src={match.lost_item.image_url || "https://via.placeholder.com/400x250?text=No+Photo"} 
                alt="Lost Item" 
                className="w-full h-48 object-cover"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-outfit">{match.lost_item.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {match.lost_item.description}
              </p>
              <div className="space-y-1 text-xs text-slate-400 pt-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <strong>Lost Location:</strong> {match.lost_item.location}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <strong>Date Lost:</strong> {match.lost_item.date_lost}
                </p>
              </div>
            </div>
          </div>

          {/* Found Item Card */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                ✨ Matched Found Item
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {match.found_item.category}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
              <img 
                src={match.found_item.image_url || "https://via.placeholder.com/400x250?text=No+Photo"} 
                alt="Found Item" 
                className="w-full h-48 object-cover"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-outfit">{match.found_item.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {match.found_item.description}
              </p>
              <div className="space-y-1 text-xs text-slate-400 pt-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>Found Location:</strong> {match.found_item.location_found}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <strong>Date Found:</strong> {match.found_item.date_found}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* AI Vector Match Score Metrics */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 font-outfit">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Multimodal Vector Similarity Breakdown
            </h4>
            <span className="text-base font-extrabold text-emerald-400">
              {int(match.overall_score * 100)}% Overall Score
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Text Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Sentence Transformer (all-MiniLM-L6-v2)</span>
                <span className="text-indigo-400">{int(match.text_similarity * 100)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${int(match.text_similarity * 100)}%` }}
                />
              </div>
            </div>

            {/* Image Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">OpenCLIP / Visual Feature Embedding</span>
                <span className="text-purple-400">{int(match.image_similarity * 100)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${int(match.image_similarity * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collection Instructions Banner */}
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
          <h4 className="font-bold text-indigo-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Item Claiming & Collection Procedure
          </h4>
          <p className="text-indigo-300/90 leading-relaxed">
            {match.found_item.collection_instructions || "Please present student/staff ID card and describe internal item details at the central collection desk."}
          </p>
          <p className="text-slate-400">
            <strong>Contact Info:</strong> {match.found_item.contact_info || "security-office@institution.edu"}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-4 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
          >
            Close Window
          </button>

          {match.status !== 'claimed' && (
            <button
              onClick={handleClaim}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Match as Claimed & Recovered
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function int(val) {
  return Math.round(val);
}
