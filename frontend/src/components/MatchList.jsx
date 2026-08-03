import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Layers,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatchList({ matches, onSelectMatch, onClaimMatch, token }) {
  const [filterConfidence, setFilterConfidence] = useState('All');
  const [claimingId, setClaimingId] = useState(null);

  const filteredMatches = matches.filter(m => {
    if (filterConfidence === 'All') return true;
    return m.confidence_level.toLowerCase() === filterConfidence.toLowerCase();
  });

  const handleClaim = async (e, match) => {
    e.stopPropagation();
    setClaimingId(match.id);

    try {
      const res = await fetch(`/api/matches/${match.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (res.ok) {
        // Trigger celebratory confetti animation!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onClaimMatch(match.id);
      }
    } catch (err) {
      console.error("Error claiming match:", err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white font-outfit">AI Match Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              FAISS Index Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time semantic similarity & OpenCLIP image vector search results
          </p>
        </div>

        {/* Confidence Filter Chips */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['All', 'High', 'Medium', 'Low'].map(conf => (
            <button
              key={conf}
              onClick={() => setFilterConfidence(conf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterConfidence === conf
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {conf}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid / List */}
      {filteredMatches.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No AI Matches Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search filter or submitting new lost and found reports. The AI engine continuously scans all entries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                {/* Visual Image Pair Comparison */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative group/img">
                    <img 
                      src={match.lost_item.image_url || "https://via.placeholder.com/150?text=Lost"} 
                      alt="Lost Item"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-rose-500/40 shadow-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-2 left-2 bg-rose-900/90 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                      Lost Item
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>

                  <div className="relative group/img">
                    <img 
                      src={match.found_item.image_url || "https://via.placeholder.com/150?text=Found"} 
                      alt="Found Item"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-emerald-500/40 shadow-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-2 left-2 bg-emerald-900/90 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Found Item
                    </span>
                  </div>
                </div>

                {/* Match Information & Descriptions */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-outfit">
                      {match.lost_item.name}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                      {match.lost_item.category}
                    </span>
                    
                    {match.status === 'claimed' ? (
                      <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Recovered & Claimed
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Lost at: <span className="text-slate-400">{match.lost_item.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Found at: <span className="text-slate-400">{match.found_item.location_found}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="font-semibold text-slate-300">Collection Instructions: </span>
                    {match.found_item.collection_instructions || "Visit Campus Security office with proof of ownership."}
                  </p>
                </div>

                {/* Score Meters & Claim Action */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                  <div className="text-left lg:text-right space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-extrabold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 badge-glow-emerald">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {int(match.overall_score * 100)}% AI Match Score
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span>Sentence Embeddings: <strong className="text-slate-200">{int(match.text_similarity * 100)}%</strong></span>
                      <span>OpenCLIP Visual: <strong className="text-slate-200">{int(match.image_similarity * 100)}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                      onClick={() => onSelectMatch(match)}
                      className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                    >
                      Compare Details
                    </button>

                    {match.status !== 'claimed' && (
                      <button
                        onClick={(e) => handleClaim(e, match)}
                        disabled={claimingId === match.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {claimingId === match.id ? 'Claiming...' : 'Mark as Claimed'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function int(val) {
  return Math.round(val);
}
